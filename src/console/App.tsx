import React, { useEffect, useState } from "react";

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
      <button onClick={onClickOpenFolderDialog}>Open folder</button>
      <p>{targetPath}</p>
    </div>
  );
};
