"""Converts the plain AR GLBs to USDZ for iPhone Quick Look (binary USD, real scale, Y up)."""
import sys, os, struct, json
import numpy as np
from pygltflib import GLTF2
from pxr import Usd, UsdGeom, UsdShade, Sdf, Gf, UsdUtils, Vt

COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NUM = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}

def accessor(g, blob, i):
    a = g.accessors[i]
    bv = g.bufferViews[a.bufferView]
    dt = np.dtype(COMP[a.componentType])
    n = NUM[a.type]
    start = (bv.byteOffset or 0) + (a.byteOffset or 0)
    stride = bv.byteStride or dt.itemsize * n
    if stride == dt.itemsize * n:
        arr = np.frombuffer(blob, dtype=dt, count=a.count * n, offset=start).reshape(a.count, n)
    else:
        arr = np.stack([np.frombuffer(blob, dtype=dt, count=n, offset=start + k * stride) for k in range(a.count)])
    return arr.astype(np.float64) if dt == np.float32 else arr.astype(np.int64)

def node_matrix(node):
    if node.matrix:
        return np.array(node.matrix, dtype=np.float64).reshape(4, 4).T
    m = np.eye(4)
    if node.scale: m = np.diag([*node.scale, 1.0]) @ m
    if node.rotation:
        x, y, z, w = node.rotation
        r = np.array([[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w)], [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w)], [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y)]])
        R = np.eye(4); R[:3, :3] = r; m = R @ m
    if node.translation:
        T = np.eye(4); T[:3, 3] = node.translation; m = T @ m
    return m

def convert(src, dst):
    g = GLTF2().load(src)
    blob = g.binary_blob()
    work = dst.replace(".usdz", ".usdc")
    stage = Usd.Stage.CreateNew(work)
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.y)
    UsdGeom.SetStageMetersPerUnit(stage, 1.0)
    root = UsdGeom.Xform.Define(stage, "/TRECC")
    stage.SetDefaultPrim(root.GetPrim())
    Usd.ModelAPI(root.GetPrim()).SetKind("component")
    mats = {}
    for mi, m in enumerate(g.materials):
        path = f"/TRECC/Materials/m{mi}"
        mat = UsdShade.Material.Define(stage, path)
        sh = UsdShade.Shader.Define(stage, path + "/Surface")
        sh.CreateIdAttr("UsdPreviewSurface")
        pbr = m.pbrMetallicRoughness
        c = pbr.baseColorFactor or [1, 1, 1, 1]
        sh.CreateInput("diffuseColor", Sdf.ValueTypeNames.Color3f).Set(Gf.Vec3f(*c[:3]))
        sh.CreateInput("metallic", Sdf.ValueTypeNames.Float).Set(float(pbr.metallicFactor if pbr.metallicFactor is not None else 1.0))
        sh.CreateInput("roughness", Sdf.ValueTypeNames.Float).Set(float(pbr.roughnessFactor if pbr.roughnessFactor is not None else 1.0))
        mat.CreateSurfaceOutput().ConnectToSource(sh.ConnectableAPI(), "surface")
        mats[mi] = mat
    k = 0
    for ni, node in enumerate(g.nodes):
        if node.mesh is None: continue
        M = node_matrix(node)
        N = np.linalg.inv(M[:3, :3]).T
        for prim in g.meshes[node.mesh].primitives:
            P = accessor(g, blob, prim.attributes.POSITION)
            Nn = accessor(g, blob, prim.attributes.NORMAL)
            I = accessor(g, blob, prim.indices).reshape(-1)
            P = (np.c_[P, np.ones(len(P))] @ M.T)[:, :3]
            Nn = Nn @ N.T
            Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-12
            mesh = UsdGeom.Mesh.Define(stage, f"/TRECC/Geom/part{k}")
            mesh.CreatePointsAttr(Vt.Vec3fArray.FromNumpy(P.astype(np.float32)))
            mesh.CreateFaceVertexCountsAttr(Vt.IntArray.FromNumpy(np.full(len(I) // 3, 3, dtype=np.int32)))
            mesh.CreateFaceVertexIndicesAttr(Vt.IntArray.FromNumpy(I.astype(np.int32)))
            # glTF winding is counter-clockwise, which is USD's default orientation (rightHanded).
            mesh.CreateNormalsAttr(Vt.Vec3fArray.FromNumpy(Nn.astype(np.float32)))
            mesh.SetNormalsInterpolation(UsdGeom.Tokens.vertex)
            mesh.CreateSubdivisionSchemeAttr(UsdGeom.Tokens.none)
            mesh.CreateDoubleSidedAttr(True)
            lo, hi = P.min(0), P.max(0)
            mesh.CreateExtentAttr([Gf.Vec3f(*lo.astype(float)), Gf.Vec3f(*hi.astype(float))])
            if prim.material is not None:
                UsdShade.MaterialBindingAPI.Apply(mesh.GetPrim()).Bind(mats[prim.material])
            k += 1
    stage.GetRootLayer().Save()
    ok = UsdUtils.CreateNewARKitUsdzPackage(Sdf.AssetPath(work), dst)
    os.remove(work)
    return ok

if __name__ == "__main__":
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for f in sorted(os.listdir(src_dir)):
        if not f.endswith(".glb"): continue
        dst = os.path.join(out_dir, f.replace(".glb", ".usdz"))
        ok = convert(os.path.join(src_dir, f), dst)
        print(f, "->", os.path.basename(dst), ok, round(os.path.getsize(dst) / 1e6, 2), "MB")
