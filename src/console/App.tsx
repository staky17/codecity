import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";


export const App = () => {
  const [targetPath, setTargetPath] = useState("");

  useEffect(() => {
    (async () => {
      const currentConfig = await window.myAPI.getCurrentConfig();
      setTargetPath(currentConfig.targetPath);
    })();
  }, []);

  const onClickOpenFolderDialog = async () => {
    const targetPath = await window.myAPI.openDialog();
    setTargetPath(targetPath);
  };
  return (
    <div className="container">
      <TextField
        label="フォルダパス"
        InputProps={{
          value: targetPath,
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
