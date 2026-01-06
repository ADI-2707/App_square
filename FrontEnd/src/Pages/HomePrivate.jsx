import React from "react";

const formatUserName = (fullName) => {
  if (!fullName || typeof fullName !== "string") return "";

  const parts = fullName.trim().split(" ");

  // If only one word, return as-is
  if (parts.length === 1) {
    return parts[0];
  }

  // If multiple words
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  const lastNameInitial = lastName.charAt(0).toUpperCase();

  return `${lastNameInitial}. ${firstName}`;
};

const HomePrivate = () => {

  const user = JSON.parse(localStorage.getItem("user"));
  const fullName = user?.full_name || "";
  const displayName = formatUserName(fullName);

  return (
    <div className="text-center mt-28">
      <h1 className="text-4xl font-bold">Welcome {displayName ? `, ${displayName}` : ""}👋</h1>
      <p className="mt-4 text-gray-400">
        This is your personalized home (content coming soon).
      </p>
    </div>
  );
};

export default HomePrivate;