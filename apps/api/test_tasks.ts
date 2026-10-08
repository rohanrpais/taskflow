async function runTests() {
  const API_URL = "http://localhost:3000/api";
  console.log("Starting Task Tests...");

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

  // Create Project A
  res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      name: "Project A",
      startDate: "2026-10-01",
      endDate: "2026-10-31"
    })
  });
  data = await res.json();
  const projectAId = data.data?.id;

  // Create Project B
  res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      name: "Project B",
      startDate: "2026-10-01",
      endDate: "2026-10-31"
    })
  });
  data = await res.json();
  const projectBId = data.data?.id;

  // B. User A creates a task under that project
  console.log("\n[TEST] B. User A creates a task under their project");
  res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      projectId: projectAId,
      name: "User A Task",
      dueDate: "2026-10-15"
    })
  });
  data = await res.json();
  console.log("Create task response:", res.status, data);
  const taskId = data.data?.id;

  // L. User B cannot create a task inside User A's project
  console.log("\n[TEST] L. User B cannot create a task inside User A's project");
  res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({
      projectId: projectAId,
      name: "User B Sneaky Task",
      dueDate: "2026-10-15"
    })
  });
  data = await res.json();
  console.log("User B Sneaky create response:", res.status, data);

  // C. User A lists the task
  console.log("\n[TEST] C. User A lists the task");
  res = await fetch(`${API_URL}/tasks`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("List response:", res.status, "Tasks count:", data.data?.length);

  // D. User A retrieves the task
  console.log("\n[TEST] D. User A retrieves the task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Get By ID response:", res.status, data.data?.name);

  // E. User A updates the task
  console.log("\n[TEST] E. User A updates the task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ name: "User A Updated Task" })
  });
  data = await res.json();
  console.log("Update response:", res.status, data.data?.name);

  // F. User A changes status to COMPLETED
  console.log("\n[TEST] F. User A changes status to COMPLETED");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ status: "COMPLETED" })
  });
  data = await res.json();
  console.log("Status update response:", res.status, data.data?.status);

  // G. User A changes priority
  console.log("\n[TEST] G. User A changes priority to HIGH");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ priority: "HIGH" })
  });
  data = await res.json();
  console.log("Priority update response:", res.status, data.data?.priority);

  // I. User B cannot read User A's task
  console.log("\n[TEST] I. User B cannot read User A's task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log("User B Get response:", res.status, data);

  // J. User B cannot update User A's task
  console.log("\n[TEST] J. User B cannot update User A's task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ status: "PENDING" })
  });
  data = await res.json();
  console.log("User B Update response:", res.status, data);

  // K. User B cannot delete User A's task
  console.log("\n[TEST] K. User B cannot delete User A's task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenB}` }
  });
  data = await res.json();
  console.log("User B Delete response:", res.status, data);

  // M. Unauthenticated requests return 401
  console.log("\n[TEST] M. Unauthenticated requests return 401");
  res = await fetch(`${API_URL}/tasks`);
  data = await res.json();
  console.log("Unauth response:", res.status, data);

  // N. Invalid task input is rejected
  console.log("\n[TEST] N. Invalid task input is rejected");
  res = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      projectId: projectAId,
      name: "" // invalid
    })
  });
  data = await res.json();
  console.log("Invalid input response:", res.status, data);

  // O. Search by task name works
  console.log("\n[TEST] O. Search by task name works");
  res = await fetch(`${API_URL}/tasks?search=Updated`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Search response:", res.status, "Count:", data.data?.length);

  // P. Status filtering works
  console.log("\n[TEST] P. Status filtering works");
  res = await fetch(`${API_URL}/tasks?status=COMPLETED`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Status filter response:", res.status, "Count:", data.data?.length);

  // Q. Priority filtering works
  console.log("\n[TEST] Q. Priority filtering works");
  res = await fetch(`${API_URL}/tasks?priority=HIGH`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Priority filter response:", res.status, "Count:", data.data?.length);

  // R. Project filtering works
  console.log("\n[TEST] R. Project filtering works");
  res = await fetch(`${API_URL}/tasks?projectId=${projectAId}`, {
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Project filter response:", res.status, "Count:", data.data?.length);

  // H. User A deletes the task
  console.log("\n[TEST] H. User A deletes the task");
  res = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${tokenA}` }
  });
  data = await res.json();
  console.log("Delete response:", res.status, data);
}

runTests().catch(console.error);
