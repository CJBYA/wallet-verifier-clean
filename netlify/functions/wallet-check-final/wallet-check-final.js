exports.handler = async (event, context) => {
  console.log("🔥 Wallet check function triggered at:", new Date().toISOString());

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Function is alive! Use POST to test further. ✅" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "POST received!" }),
  };
};
