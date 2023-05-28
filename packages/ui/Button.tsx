"use client";

import * as React from "react";

export const Button = (props: { test?: string }) => {
  const { test } = props;
  React.useEffect(() => {
    console.log(test);
  }, []);
  return <button onClick={() => alert("boop")}>Boop</button>;
};
