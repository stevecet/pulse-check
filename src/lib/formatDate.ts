export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString.replace(" ", "T"));
  return date.toLocaleString();
};
