// src/App.js
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setData } from "./store";
import Chart from "./components/Chart";

const sampleData = [
  {
    year: 2020,
    russia: 78,
    near: 15,
    far: 63,
    children: 0,
    beforRussia: 90,
    beforNear: 18,
    beforFar: 72,
    beforСhildren: 0,
  },
  {
    year: 2021,
    russia: 102,
    near: 18,
    far: 72,
    children: 0,
  },
  {
    year: 2022,
    russia: 276,
    near: 48,
    far: 180,
    children: 252,
  },
];

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setData(sampleData));
  }, [dispatch]);

  return (
    <>
      <Chart />
    </>
  );
};

export default App;
