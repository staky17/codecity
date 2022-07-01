import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import logo from "./logo_white.svg";
import Grid from "@mui/material/Grid";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

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

  // const onClickResetFolder = () => {
  //   setTargetPath("");
  // };

  return (
    <div style={{ padding: "0 16px" }}>
      <header style={{ padding: "32px 16px", textAlign: "center" }}>
        <img src={logo} style={{ maxWidth: "320px", width: "100%" }} />
        <div style={{ width: "100%", textAlign: "right", color: "#ffffff" }}>
          Presented by Staky
        </div>
      </header>

      <div
        style={{
          display: "flex",
          background: "#ffffffc0",
          padding: "8px",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      >
        <TextField
          InputProps={{
            value: targetPath,
            readOnly: true,
          }}
          style={{ flexGrow: 1, marginRight: "8px" }}
          variant="outlined"
          onClick={onClickOpenFolderDialog}
        />
        <Button
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          onClick={onClickOpenFolderDialog}
        >
          参照
        </Button>
      </div>

      <div
        style={{
          background: "#ffffffc0",
          padding: "8px",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ fontSize: "1.5em" }}>コードを書いて、街をつくろう</h1>
        <p>
          フォルダを参照すれば，あなたの作成したファイルから建物が生まれ、デスクトップにあなただけの街が生まれます。
          <br />
          同期されたフォルダに新しくファイルが作成されればリアルタイムに建物が生まれ、街は発展していきます。
          <br />
        </p>
        <p></p>
      </div>

      {/* <Grid item>
        <Button
          variant="outlined"
          startIcon={<DeleteOutlineIcon />}
          onClick={onClickResetFolder}
          disabled={targetPath === ""}
        >
          リセット
        </Button>
      </Grid> */}
    </div>
  );
};
