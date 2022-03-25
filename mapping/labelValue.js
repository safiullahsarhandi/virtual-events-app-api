exports.convertToLabelValue = (arr, value, label) => {
  const mapped = [];
  arr.reduce((previous_value, current_value, current_index, array) => {
    mapped[current_index] = {
      label: current_value[label],
      value: current_value[value],
    };
  }, 0);
  return mapped;
};
