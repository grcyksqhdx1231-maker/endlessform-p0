export const CHAIR_STATES = [
  {
    id: "pink",
    angle: 0,
    color: "#E8B7BE",
    copy: "我想要一把粉色的椅子",
  },
  {
    id: "blue",
    angle: 72,
    color: "#A9C3DF",
    copy: "我想要一把蓝色的椅子",
  },
  {
    id: "purple",
    angle: 144,
    color: "#BBA6D6",
    copy: "我想要一把紫色的椅子",
  },
  {
    id: "red",
    angle: 216,
    color: "#E65349",
    copy: "我想要一把红色的椅子",
  },
  {
    id: "green",
    angle: 288,
    color: "#A8BE98",
    copy: "我想要一把绿色的椅子",
  },
] as const;

export type ChairState = (typeof CHAIR_STATES)[number];
export type ChairStateId = ChairState["id"];

export const STATE_COUNT = CHAIR_STATES.length;
export const STATE_STEP_DEGREES = 72;
export const STATE_STEP_RADIANS = (Math.PI * 2) / STATE_COUNT;
