async function runTests() {
  const API_URL = "http://localhost:3000/api";
  console.log("Starting Dashboard Tests...");

  // Register User A
  let res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "User A", email: `usera${Date.now()}@example.com`, password: "password123" }),
  });
  let data = await res.json();
  const tokenA = data.data?.token;

  // Register User B
  res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "User B", email: `userb${Date.now()}@example.com`, password: "password123" }),
  });
  data = await res.json();
  const tokenB = data.data?.token;

  // Create Project A1 for User A
  res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: "Project A1",
      startDate: "2026-10-01",
      endDate: "2026-10-31"
    })
  });
  data = await res.json();
  const projectA1Id = data.data?.id;
  
  // Set project A1 to IN_PROGRESS
  await fetch(`${API_URL}/projects/${projectA1Id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "IN_PROGRESS" })
  });

  // Create Task A1 (PENDING) for User A
  res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      projectId: projectA1Id,
      name: "Task A1",
      dueDate: "2026-10-15"
    })
  });
  
  // Create Task A2 (COMPLETED) for User A
  res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      projectId: projectA1Id,
      name: "Task A2",
      dueDate: "2026-10-15"
    })
  });
  data = await res.json();
  const taskA2Id = data.data?.id;

  // Complete Task A2
  await fetch(`${API_URL}/tasks/${taskA2Id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "COMPLETED" })
  });

  // A. User A receives only User A's counts
  console.log("\n[TEST] A. User A receives only User A's counts");
  res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${tokenA}` } });
  data = await res.json();
  console.log("User A Dashboard:", res.status, data);

  // B. User B receives only User B's counts
  console.log("\n[TEST] B. User B receives only User B's counts");
  res = await fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${tokenB}` } });
  data = await res.json();
  console.log("User B Dashboard:", res.status, data);

  // C. Unauthenticated request returns 401
  console.log("\n[TEST] C. Unauthenticated request returns 401");
  res = await fetch(`${API_URL}/dashboard`);
  console.log("Unauthenticated response:", res.status);
}

runTests().catch(console.error);
