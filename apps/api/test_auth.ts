async function runTests() {
  const API_URL = "http://localhost:3000/api";
  console.log("Starting Auth Tests...");

  // 1. Register
  console.log("\n[TEST] Register:");
  let res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
    }),
  });
  let data = await res.json();
  console.log("Register response:", res.status, data);

  // 2. Register duplicate
  console.log("\n[TEST] Register Duplicate:");
  res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "John Doe",
      email: "john@example.com",
      password: "password123",
    }),
  });
  data = await res.json();
  console.log("Register Duplicate response:", res.status, data);

  // 3. Login
  console.log("\n[TEST] Login:");
  res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "john@example.com",
      password: "password123",
    }),
  });
  data = await res.json();
  console.log("Login response:", res.status, data);
  const token = data.data?.token;

  // 4. Invalid Login
  console.log("\n[TEST] Invalid Login:");
  res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "john@example.com",
      password: "wrongpassword",
    }),
  });
  data = await res.json();
  console.log("Invalid Login response:", res.status, data);

  // 5. Get Me (Protected)
  console.log("\n[TEST] Get Me (with token):");
  res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Get Me response:", res.status, data);

  // 6. Get Me (Invalid token)
  console.log("\n[TEST] Get Me (invalid token):");
  res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer invalidtoken` },
  });
  data = await res.json();
  console.log("Get Me (invalid token) response:", res.status, data);

  // 7. Logout
  console.log("\n[TEST] Logout:");
  res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  data = await res.json();
  console.log("Logout response:", res.status, data);
}

runTests().catch(console.error);
