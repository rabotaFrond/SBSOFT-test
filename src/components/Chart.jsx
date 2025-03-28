import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Bar } from "react-chartjs-2";
import { setCategory, toggleChildren } from "../store";
import { Button, Container, Select, MenuItem } from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement, // <-- Это есть
  PointElement, // <-- Добавляем!
  LineController, // <-- Добавляем!
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import "./chart.css";

// Инициализация Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement, // <-- Добавили
  LineController, // <-- Добавили
  Title,
  Tooltip,
  Legend,
  Filler
);

// Метки категорий
const categoryLabels = {
  russia: "Граждане РФ",
  near: "Ближнее зарубежье",
  far: "Дальнее зарубежье",
};

const Chart = () => {
  const dispatch = useDispatch();
  const { data, selectedCategory, showChildren } = useSelector(
    (state) => state.tourist
  );
  const [isMenuVisible, setIsMenuVisible] = useState(true);

  // Расчет данных с темпами роста
  const filteredData = useMemo(() => {
    return data.map((item, index) => {
      const prevYear = data[index - 1]; // Предыдущий год, если он есть
      let growthRate = {};
      let total = 0;
      let prevTotal = 0;

      if (showChildren) {
        // Темп роста только для детей
        total = item.children || 0;
        prevTotal =
          index === 0 ? item.beforeChildren || 0 : prevYear?.children || 0;
      } else if (selectedCategory === "all") {
        // Темп роста для всех категорий
        total =
          (item.russia || 0) +
          (item.near || 0) +
          (item.far || 0) +
          (item.children || 0);
        prevTotal =
          index === 0
            ? (item.beforeRussia || 0) +
              (item.beforeNear || 0) +
              (item.beforeFar || 0) +
              (item.beforeChildren || 0)
            : (prevYear?.russia || 0) +
              (prevYear?.near || 0) +
              (prevYear?.far || 0) +
              (prevYear?.children || 0);
      } else {
        // Темп роста для выбранной категории
        total = item[selectedCategory] || 0;
        prevTotal =
          index === 0
            ? item[
                `before${
                  selectedCategory.charAt(0).toUpperCase() +
                  selectedCategory.slice(1)
                }`
              ] || 0
            : prevYear?.[selectedCategory] || 0;
      }

      // Расчёт совокупного темпа роста
      growthRate["Совокупный темп роста"] =
        prevTotal !== 0 ? (total / prevTotal) * 100 - 100 : total > 0 ? 100 : 0;

      // Возвращаем данные в зависимости от фильтра
      if (showChildren) {
        return {
          year: item.year,
          Дети: item.children !== undefined ? item.children : 0,
          ...growthRate,
        };
      }

      if (selectedCategory === "all") {
        return {
          year: item.year,
          [categoryLabels.russia]: item.russia,
          [categoryLabels.near]: item.near,
          [categoryLabels.far]: item.far,
          ...growthRate,
        };
      } else {
        return {
          year: item.year,
          [categoryLabels[selectedCategory]]: item[selectedCategory],
          ...growthRate,
        };
      }
    });
  }, [data, selectedCategory, showChildren]);

  const handleToggleChildren = () => {
    dispatch(toggleChildren());
    setIsMenuVisible((prev) => !prev);
  };

  // Данные для столбцов (абсолютные значения)
  const barDatasets = showChildren
    ? [
        {
          label: "Дети",
          data: filteredData.map((item) => item["Дети"] || 0),
          backgroundColor: "rgba(212, 212, 249, 0.5)",
          stack: "stack1",
          borderColor: "#d4d4f9",
          borderWidth: 1,
          order: 1,
        },
      ]
    : selectedCategory === "all"
    ? [
        {
          label: "Граждане РФ",
          data: filteredData.map((item) => item["Граждане РФ"] || 0),
          backgroundColor: "rgba(136, 132, 216, 0.5)",
          stack: "stack1",
          borderColor: "#8884d8",
          borderWidth: 1,
          order: 1,
        },
        {
          label: "Ближнее зарубежье",
          data: filteredData.map((item) => item["Ближнее зарубежье"] || 0),
          backgroundColor: "rgba(130, 202, 157, 0.5)",
          stack: "stack1",
          borderColor: "#82ca9d",
          borderWidth: 1,
          order: 1,
        },
        {
          label: "Дальнее зарубежье",
          data: filteredData.map((item) => item["Дальнее зарубежье"] || 0),
          backgroundColor: "rgba(255, 198, 88, 0.5)",
          stack: "stack1",
          borderColor: "#ffc658",
          borderWidth: 1,
          order: 1,
        },
      ]
    : [
        {
          label: categoryLabels[selectedCategory],
          data: filteredData.map(
            (item) => item[categoryLabels[selectedCategory]] || 0
          ),
          backgroundColor: "rgba(136, 132, 216, 0.5)",
          stack: "stack1",
          borderColor: "#8884d8",
          borderWidth: 1,
          order: 1,
        },
      ];

  // Данные для линии (совокупный темп роста)
  const lineDatasets = [
    {
      label: "Совокупный темп роста",
      data: filteredData.map((item) => item["Совокупный темп роста"] || 0),
      borderColor: "#ff7300",
      backgroundColor: "#ff7300",
      borderWidth: 2,
      fill: false,
      yAxisID: "y-axis-2",
      type: "line",
      order: 0,
    },
  ];

  // Объединение данных для графика
  const chartData = {
    labels: filteredData.map((item) => item.year),
    datasets: [...barDatasets, ...lineDatasets],
  };

  // Настройки графика
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        title: { display: true, text: "Количество" },
      },
      "y-axis-2": {
        type: "linear",
        position: "right",
        beginAtZero: true,
        ticks: { max: 500, min: -100, stepSize: 50 },
        title: { display: true, text: "Темп роста (%)" },
      },
    },
  };

  return (
    <Container className="chart-container">
      <h1 className="header">Динамика туристского потока</h1>
      {isMenuVisible && (
        <Select
          value={selectedCategory}
          onChange={(e) => dispatch(setCategory(e.target.value))}
          disabled={showChildren}
          className="category-select"
        >
          <MenuItem value="all">Все туристы</MenuItem>
          <MenuItem value="russia">Граждане РФ</MenuItem>
          <MenuItem value="near">Ближнее зарубежье</MenuItem>
          <MenuItem value="far">Дальнее зарубежье</MenuItem>
        </Select>
      )}

      {!showChildren && (
        <Button
          onClick={handleToggleChildren}
          variant="outlined"
          className="toggle-button"
        >
          Дети
        </Button>
      )}
      {showChildren && (
        <Button
          onClick={handleToggleChildren}
          variant="contained"
          className="toggle-button-contained"
        >
          Дети
        </Button>
      )}

      <Bar data={chartData} options={chartOptions} />
    </Container>
  );
};

export default Chart;
