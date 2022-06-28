import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Container } from "@mui/system";
import logo from "./codecity_logo.png";
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

  const onClickResetFolder = () => {
    setTargetPath("");
  };

  return (
    <>
      <Container maxWidth="lg">
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={3}
        >
          <Grid item>
            <img src={logo} />
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={onClickOpenFolderDialog}
            >
              フォルダを開く
            </Button>
          </Grid>
          <Grid item>
            <TextField
              label="フォルダパス"
              InputProps={{
                value: targetPath,
                readOnly: true,
              }}
              variant="standard"
              onClick={onClickOpenFolderDialog}
            />
          </Grid>

          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={onClickResetFolder}
              disabled={targetPath === ""}
            >
              リセット
            </Button>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};
