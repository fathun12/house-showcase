import { Box3, Group, MathUtils, Matrix4, Vector3 } from "three";
import type { Object3D } from "three";
import { otherAxes } from "./config";
import type { Axis, PartConfig } from "./config";

const UNIT: Record<Axis, Vector3> = {
  x: new Vector3(1, 0, 0),
  y: new Vector3(0, 1, 0),
  z: new Vector3(0, 0, 1),
};

export type Rig = {
  /** 0 = closed, 1 = fully open */
  set: (progress: number) => void;
  /** Puts the part back where it was, without the helper group */
  dispose: () => void;
};

/**
 * Wraps one part in a helper group that moves it: a slide moves the group, a hinge turns
 * it around an edge of the part's box. The part itself is never edited.
 */
export function createRig(object: Object3D, config: PartConfig): Rig | null {
  const parent = object.parent;
  if (!parent || config.motion === "none") return null;

  parent.updateWorldMatrix(true, false);
  const box = new Box3().setFromObject(object);
  if (box.isEmpty()) return null;

  const { settings } = config;
  const mover = new Group();
  let apply: (progress: number) => void;

  if (config.motion === "slide") {
    const sign = settings.dir.endsWith("-") ? -1 : 1;
    const axis = UNIT[settings.dir[0] as Axis].clone().multiplyScalar(sign);
    const size = box.getSize(new Vector3());
    const extent =
      Math.abs(axis.x) * size.x + Math.abs(axis.y) * size.y + Math.abs(axis.z) * size.z;
    const center = box.getCenter(new Vector3());
    const from = parent.worldToLocal(center.clone());
    const to = parent.worldToLocal(
      center.clone().addScaledVector(axis, (extent * settings.amount) / 100),
    );
    const delta = to.sub(from);

    apply = (progress) => {
      mover.position.copy(delta).multiplyScalar(progress);
    };
    parent.add(mover);
  } else {
    const [axisA, axisB] = otherAxes(settings.axis);
    const pivot = box.getCenter(new Vector3());
    pivot[axisA] = box[settings.pivotA][axisA];
    pivot[axisB] = box[settings.pivotB][axisB];

    mover.position.copy(parent.worldToLocal(pivot.clone()));
    parent.add(mover);

    const axisLocal = UNIT[settings.axis]
      .clone()
      .transformDirection(new Matrix4().copy(parent.matrixWorld).invert());
    const angle = MathUtils.degToRad(settings.angle);

    apply = (progress) => {
      mover.quaternion.setFromAxisAngle(axisLocal, angle * progress);
    };
  }

  mover.updateWorldMatrix(true, false);
  mover.attach(object);

  return {
    set: apply,
    dispose: () => {
      apply(0);
      mover.updateWorldMatrix(true, false);
      parent.attach(object);
      parent.remove(mover);
    },
  };
}