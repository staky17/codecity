import React, { useState, useEffect } from "react";

const { myAPI } = window;

export const App = () => {
  const [folderPath, setFolderPath] = useState();

  const onClickOpenFolderDialog = async () => {
    const folderPathName = await window.myAPI.openDialog();
    setFolderPath(folderPathName);
  };
  return (
    <div className="container">
      <button onClick={onClickOpenFolderDialog} id="button">
        Open folder
      </button>
      <p id="text">{folderPath}</p>
    </div>
  );
};
