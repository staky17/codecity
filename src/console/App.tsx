import React, { useState } from "react";

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
