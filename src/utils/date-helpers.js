const days = ["Sun", "Mon", "Tues", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const getDayOfWeek = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return days[d.getDay()];
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

export const formatTime = (time) => {
  if (!time) return "";
  let [hour, min] = time.split(":");
  if (+hour > 12) hour = +hour - 12;
  return `${hour}:${min}`;
};

