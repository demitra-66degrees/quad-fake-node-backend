const jsonServer = require("json-server");
const express = require("express");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const path = require("path");

server.use(middlewares);

// Simulate delay for all routes
server.use((req, res, next) => {
  setTimeout(next, 500);
});

server.use(express.json());

// Custom GET route for events
server.get("/brand/:brand_id/events", (req, res) => {
  const { brand_id } = req.params;
  const { search_term = "", limit = 10, last_id } = req.query;
  const events = router.db.get("event").value();

  // Filter brands based on search_term
  let filteredEvents = events.filter((event) => event.brand_id === brand_id);
  if (search_term) {
    filteredEvents = filteredEvents.filter((event) =>
      event.name.toLowerCase().includes(search_term.toLowerCase())
    );
  }

  // If last_id is provided, find the index of the last_id and start from there
  let startIndex = 0;
  if (last_id) {
    const index = filteredEvents.findIndex((event) => event.id === last_id);
    startIndex = index >= 0 ? index + 1 : 0;
  }

  // Implement pagination using cursor method
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + parseInt(limit)
  );
  const newLastId =
    paginatedEvents.length > 0
      ? paginatedEvents[paginatedEvents.length - 1].id
      : null;

  res.json({
    limit: parseInt(limit),
    last_id: newLastId,
    data: paginatedEvents,
  });
});

// GET /event/{event_id}
server.get("/event/:event_id", (req, res) => {
  const { event_id } = req.params;
  const event = router.db.get("event").find({ id: event_id }).value();

  if (event) {
    res.json({ data: event });
  } else {
    res.status(404).json({ message: "Event not found" });
  }
});

// POST /brand/:brand_id/event
server.post("/brand/:brand_id/events", (req, res) => {
  const { brand_id } = req.params;
  console.log(req.body);
  const newEvent = {
    ...req.body,
    brand_id: brand_id,
    id: Date.now().toString(), // Generate a unique ID
    created_by: "user_12",
    created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
  };

  try {
    // Push the new event
    router.db.get("event").push(newEvent).write();
    res.status(201).json({ data: newEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Couldn't create event" });
  }
});

// PATCH /event/:event_id
server.patch("/event/:event_id", (req, res) => {
  const { event_id } = req.params;
  const updatedFields = req.body;
  const event = router.db.get("event").find({ id: event_id }).value();

  if (event) {
    try {
      const updatedEvent = {
        ...event,
        ...updatedFields,
      };

      // Write the updated event to the database
      router.db
        .get("event")
        .find({ id: event_id })
        .assign(updatedEvent)
        .write();

      res.status(200).json({ data: updatedEvent });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Couldn't update event" });
    }
  } else {
    res.status(404).json({ message: "Event not found" });
  }
});

// Custom GET route for projects
server.get("/projects", (req, res) => {
  const { brand_id } = req.params;
  const { search_term = "", limit = 10, last_id } = req.query;
  const projects = router.db.get("project").value();

  // Filter brands based on search_term
  let filteredProjects = projects;
  if (search_term) {
    filteredProjects = filteredProjects.filter((project) =>
      project.name.toLowerCase().includes(search_term.toLowerCase())
    );
  }

  // If last_id is provided, find the index of the last_id and start from there
  let startIndex = 0;
  if (last_id) {
    const index = filteredProjects.findIndex(
      (project) => project.id === last_id
    );
    startIndex = index >= 0 ? index + 1 : 0;
  }

  // Implement pagination using cursor method
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + parseInt(limit)
  );
  const newLastId =
    paginatedProjects.length > 0
      ? paginatedProjects[paginatedProjects.length - 1].id
      : null;

  res.json({
    limit: parseInt(limit),
    last_id: newLastId,
    data: paginatedProjects,
  });
});

// GET /project/{project_id}
server.get("/project/:project_id", (req, res) => {
  const { project_id } = req.params;
  const project = router.db.get("project").find({ id: project_id }).value();

  if (project) {
    res.json({ data: project });
  } else {
    res.status(404).json({ message: "Project not found" });
  }
});

// POST /brand/:brand_id/projects
server.post("/brand/:brand_id/projects", (req, res) => {
  const { brand_id } = req.params;
  console.log(req.body);
  const newProject = {
    ...req.body,
    brand_id: brand_id,
    id: Date.now().toString(), // Generate a unique ID
    created_by: "user_12",
    created_at: new Date().toISOString().replace("T", " ").slice(0, 19),
  };

  try {
    // Push the new project
    router.db.get("project").push(newProject).write();
    res.status(201).json({ data: newProject });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Couldn't create project" });
  }
});

server.get("/pdf", (req, res) => {
  const pdfPath = path.join(__dirname, "public/template.pdf");
  res.sendFile(pdfPath);
});

server.use(router);

const app = express();
app.use(server);

const PORT = 6969;
app.listen(PORT, () => {
  console.log("Server is running on...");
});
