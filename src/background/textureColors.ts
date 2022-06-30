import { Nightlife } from "@mui/icons-material";

// export const colors = {
//   night_fade: [0xa18cd1, 0xfbc2eb],
//   rainy_ashville: [0xfbc2eb, 0xa6c1ee],
//   tempting_azure: [0x84fab0, 0x8fd3f4],
//   amy_crisp: [0xa6c0fe, 0xf68084],
//   mprphius_den: [0x330867, 0x30cfd0],
//   plum_plate: [0x764ba2, 0x667eea],
//   sharpeye_eagle: [0x9890e3, 0xb1f4cf],
// };

const colors: { [name: string]: [string, string] } = {
  night_fade: ["#a18cd1", "#fbc2eb"],
  rainy_ashville: ["#fbc2eb", "#a6c1ee"],
  amy_crisp: ["#a6c0fe", "#f68084"],
};

export const extColors: { [name: string]: [string, string] } = {
  ".ts": ["#a1c4fd", "#c2e9fb"],
  ".tsx": ["#a1c4fd", "#c2e9fb"],
  ".js": ["#abecd6", "#fbed96"],
  ".jsx": ["#abecd7", "#fbed97"],
  ".css": ["#93a5cf", "#e4efe9"],
  ".html": ["#fda085", "#fee140"],
  ".rb": ["#cf556c", "#ff8177"],
  ".py": ["#fddb92", "#d1fdff"],
  ".c": ["#e6e9f0", "#eef1f5"],
  ".h": ["#9795f0", "#fbc8d4"],
  ".m": ["#d9afd9", "#97d9e1"],
  ".cpp": ["#65689f", "#b5aee4"],
  ".cs": ["#8fd3f4", "#84fab0"],
  ".kt": ["#fcc5e4", "#fbc8d4"],
  ".swift": ["#f6d365", "#eb5039"],
  ".go": ["#8fd2f9", "#367b8f"],
  ".rs": ["#4f4f4f", "#fafafa"],
  ".r": ["#e7f0fd", "#eef1f5"],
  ".sh": ["#80d0c7", "#4f4f4f"],
  ".xml": ["#ffb199", "#ff0844"],
  ".yml": ["#fbed96", "#f6d365"],
  ".md": ["#c79081", "#dfa579"],
  ".jpg": ["#00cdac", "#8ddad5"],
  ".jpeg": ["#00cdac", "#8ddad5"],
  ".png": ["#00cdac", "#8ddad5"],
  ".gif": ["#00cdac", "#8ddad5"],
  ".svg": ["#d1fdff", "#fddb92"],
  ".txt": ["#bdc2e8", "#88d3ce"],
  ".csv": ["#bdc2e8", "#88d3ce"],
  ".tsv": ["#9795f0", "#88d3ce"],
  ".docx": ["#9795f0", "#a1c4fd"],
  ".xlsx": ["#80d0c7", "#abecd6"],
  ".pptx": ["#ff8177", "#fda085"],
  ".java": ["#209cff", "#68e0cf"],
  "": ["#a6c0fe", "#f68084"],
};
