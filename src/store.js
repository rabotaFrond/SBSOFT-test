import { configureStore, createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: [], // Данные о туристическом потоке
  selectedCategory: "all", // Фильтр категорий туристов
  showChildren: false, // Флаг отображения данных по детям
};

const touristSlice = createSlice({
  name: "tourist",
  initialState,
  reducers: {
    setData: (state, action) => {
      state.data = action.payload.map((item) => ({
        year: item.year,
        russia: item.russia,
        near: item.near,
        far: item.far,
        children: item.children,
        beforeRussia: item.beforRussia,
        beforeNear: item.beforNear,
        beforeFar: item.beforFar,
        beforeChildren: item.beforСhildren,
      }));
    },
    setCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    toggleChildren: (state) => {
      state.showChildren = !state.showChildren;
    },
  },
});

export const { setData, setCategory, toggleChildren } = touristSlice.actions;
export const store = configureStore({
  reducer: { tourist: touristSlice.reducer },
});
