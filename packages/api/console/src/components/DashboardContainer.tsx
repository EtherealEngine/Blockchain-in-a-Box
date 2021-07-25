import React from "react";
import NavigationPanel from "./NavigationPanel";
import "../App.css";

const DashboardContainer: React.FunctionComponent = ({ children }) => {
  return (
    <div>
      <NavigationPanel />
      Container
      {children}
    </div>
  );
};

export default DashboardContainer;
