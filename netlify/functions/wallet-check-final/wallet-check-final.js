exports.handler = async (event, context) => {
  console.log("🔥 Wallet check function triggered at:", new Date().toISOString());

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Function is working! ✅" }),
  };
};
