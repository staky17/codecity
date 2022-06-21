import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const { myAPI } = window;

export const App = () => {
  const [folderPath, setFolderPath] = useState("");

  const onClickOpenFolderDialog = async () => {
    const folderPathName = await window.myAPI.openDialog();
    if (folderPathName !== "") setFolderPath(folderPathName);
  };
  return (
    <div className="container">
      <TextField
        label="フォルダパス"
        InputProps={{
          value: folderPath,
          readOnly: true,
        }}
        variant="standard"
        onClick={onClickOpenFolderDialog}
      />
      <Button variant="text" onClick={onClickOpenFolderDialog}>
        フォルダを開く
      </Button>
    </div>
  );
};
