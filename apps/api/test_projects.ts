async function runTests() {
  const API_URL = "http://localhost:3000/api";
  console.log("Starting Project Tests...");

  // Register User A
  let res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "User A", email: "usera@example.com", password: "password123" }),
  });
  let data = await res.json();
  const tokenA = data.data?.token;

  // Register User B
  res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: "User B", email: "userb@example.com", password: "password123" }),
  });
  data = await res.json();
  const tokenB = data.data?.token;

  if (!tokenA || !tokenB) {
    console.error("Failed to setup users");
    return;
  }

  // A. User A creates a project
  console.log("\n[TEST] A. User A creates a project");
  res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: "User A Project",
      description: "Test description",
      startDate: "2026-10-01",
      endDate: "2026-10-31"
    })
  });
  data = await res.json();
  console.log("Create response:", res.status, data);
  const projectId = data.data?.id;

  // B. User A can list the project
  console.log("\n[TEST] B. User A can list the project");
  res = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("List response:", res.status, "Projects count:", data.data?.length);

  // C. User A can retrieve it by ID
  console.log("\n[TEST] C. User A can retrieve it by ID");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Get By ID response:", res.status, data.data?.name);

  // D. User A can update it
  console.log("\n[TEST] D. User A can update it");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      status: "IN_PROGRESS"
    })
  });
  data = await res.json();
  console.log("Update response:", res.status, data.data?.status);

  // F. User B cannot retrieve User A's project
  console.log("\n[TEST] F. User B cannot retrieve User A's project");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log("User B Get response:", res.status, data);

  // G. User B cannot update User A's project
  console.log("\n[TEST] G. User B cannot update User A's project");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: "COMPLETED" })
  });
  data = await res.json();
  console.log("User B Update response:", res.status, data);

  // H. User B cannot delete User A's project
  console.log("\n[TEST] H. User B cannot delete User A's project");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log("User B Delete response:", res.status, data);

  // I. Unauthenticated requests receive 401
  console.log("\n[TEST] I. Unauthenticated requests receive 401");
  res = await fetch(`${API_URL}/projects`);
  data = await res.json();
  console.log("Unauthenticated response:", res.status, data);

  // J. Invalid project input is rejected
  console.log("\n[TEST] J. Invalid project input is rejected");
  res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: "", // Invalid
      startDate: "2026-10-31",
      endDate: "2026-10-01" // Invalid (before start)
    })
  });
  data = await res.json();
  console.log("Invalid input response:", res.status, data);

  // K. Search by project name works
  console.log("\n[TEST] K. Search by project name works");
  res = await fetch(`${API_URL}/projects?search=User A`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Search response:", res.status, "Count:", data.data?.length);

  // L. Project status filtering works
  console.log("\n[TEST] L. Project status filtering works");
  res = await fetch(`${API_URL}/projects?status=IN_PROGRESS`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Filter response:", res.status, "Count:", data.data?.length);

  // E. User A can delete it
  console.log("\n[TEST] E. User A can delete it");
  res = await fetch(`${API_URL}/projects/${projectId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Delete response:", res.status, data);
}

runTests().catch(console.error);
