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

// Custom GET route for fetching a client by _id
server.get("/client/:id", (req, res) => {
  const clientId = req.params.id;
  const client = router.db.get("client").find({ id: clientId }).value();

  if (client) {
    res.json({ data: client });
  } else {
    res.status(404).json({ message: "Client not found" });
  }
});

// Custom GET route for clients
server.get("/client", (req, res) => {
  const { search_term = "", limit = 10, last_id } = req.query;
  const clients = router.db.get("client").value();

  // Filter clients based on search_term
  let filteredClients = clients;
  if (search_term) {
    filteredClients = clients.filter((client) =>
      client.name.toLowerCase().includes(search_term.toLowerCase())
    );
  }

  // If last_id is provided, find the index of the last_id and start from there
  let startIndex = 0;
  if (last_id) {
    const index = filteredClients.findIndex((client) => client.id === last_id);
    startIndex = index >= 0 ? index + 1 : 0;
  }

  // Implement pagination using cursor method
  const paginatedClients = filteredClients.slice(
    startIndex,
    startIndex + parseInt(limit)
  );
  const newLastId =
    paginatedClients.length > 0
      ? paginatedClients[paginatedClients.length - 1].id
      : null;

  res.json({
    limit: parseInt(limit),
    last_id: newLastId,
    data: paginatedClients,
  });
});

// Custom GET route for brands for a specific client
server.get("/client/:client_id/brand", (req, res) => {
  const { client_id } = req.params;
  const { search_term = "", limit = 10, last_id } = req.query;
  const brands = router.db.get("brand").value();

  // Filter brands based on client_id and search_term
  let filteredBrands = brands.filter((brand) => brand.client_id === client_id);
  if (search_term) {
    filteredBrands = filteredBrands.filter((brand) =>
      brand.name.toLowerCase().includes(search_term.toLowerCase())
    );
  }

  // If last_id is provided, find the index of the last_id and start from there
  let startIndex = 0;
  if (last_id) {
    const index = filteredBrands.findIndex((brand) => brand.id === last_id);
    startIndex = index >= 0 ? index + 1 : 0;
  }

  // Implement pagination using cursor method
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + parseInt(limit)
  );
  const newLastId =
    paginatedBrands.length > 0
      ? paginatedBrands[paginatedBrands.length - 1].id
      : null;

  res.json({
    limit: parseInt(limit),
    last_id: newLastId,
    data: paginatedBrands,
  });
});

// Custom GET route for ALL brands
server.get("/brand", (req, res) => {
  const { search_term = "", limit = 10, last_id } = req.query;
  const brands = router.db.get("brand").value();

  // Filter brands based on search_term
  let filteredBrands = brands.slice(0, 50);
  if (search_term) {
    filteredBrands = brands.filter((brand) =>
      brand.name.toLowerCase().includes(search_term.toLowerCase())
    );
  }

  // If last_id is provided, find the index of the last_id and start from there
  let startIndex = 0;
  if (last_id) {
    const index = filteredBrands.findIndex((brand) => brand.id === last_id);
    startIndex = index >= 0 ? index + 1 : 0;
  }

  // Implement pagination using cursor method
  const paginatedBrands = filteredBrands.slice(
    startIndex,
    startIndex + parseInt(limit)
  );
  const newLastId =
    paginatedBrands.length > 0
      ? paginatedBrands[paginatedBrands.length - 1].id
      : null;

  res.json({
    limit: parseInt(limit),
    last_id: newLastId,
    data: paginatedBrands,
  });
});

// Custom GET route for events
server.get("/brand/:brand_id/event", (req, res) => {
  const { brand_id } = req.params;
  const { search_term = "", limit = 10, last_id } = req.query;
  const events = router.db.get("event").value();

  // Filter brands based on search_term
  let filteredEvents = events.filter((event) => event.brand_id === brand_id);
  if (search_term) {
    filteredEvents = events.filter((event) =>
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

// POST /client/:client_id/brand
server.post("/client/:client_id/brand", (req, res) => {
  const clientId = req.params.client_id;
  const newBrand = {
    ...req.body,
    id: Date.now().toString(), // Generate a unique ID
    client_id: clientId,
    brand_guideline: {
      brand_voice: "", // Default value
      colors: [], // Default empty array
      typography: [], // Default empty array
      imagery_guidelines: [], // Default empty array
    },
    brand_reference: {
      supplemental_instruction:
        req.body.brand_reference?.supplemental_instruction || "",
      reference_web_pages: req.body.brand_reference?.reference_web_pages || [],
      uploaded_files: req.body.brand_reference?.uploaded_files || [],
    },
  };

  try {
    const client = router.db.get("client").find({ id: clientId }).value();

    if (!client) {
      return res
        .status(404)
        .json({ message: `Client with id: ${clientId} not found` });
    }

    // Push the new brand
    router.db.get("brand").push(newBrand).write();
    res.status(201).json({ data: newBrand });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Couldn't create brand" });
  }
});

// PATCH /client/:client_id/brand/:brand_id
server.patch("/client/:client_id/brand/:brand_id", (req, res) => {
  const { client_id, brand_id } = req.params;
  const updatedFields = req.body;
  console.log("REQUEST", req.body);
  const brand = router.db
    .get("brand")
    .find({ id: brand_id, client_id })
    .value();

  if (brand) {
    try {
      // Deep merge for nested objects like brand_guideline and brand_reference
      const updatedBrand = {
        ...brand,
        ...updatedFields, // Shallow merge top-level fields

        // Merge nested brand_guideline
        brand_guideline: {
          ...brand.brand_guideline, // Existing brand_guideline fields
          ...updatedFields.brand_guideline, // New/updated fields
        },

        // Merge nested brand_reference
        brand_reference: {
          ...brand.brand_reference, // Existing brand_reference fields
          ...updatedFields.brand_reference, // New/updated fields
        },
      };

      // Write the updated brand to the database
      router.db
        .get("brand")
        .find({ id: brand_id })
        .assign(updatedBrand)
        .write();

      res.status(200).json({ data: updatedBrand });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Couldn't update brand" });
    }
  } else {
    res.status(404).json({ message: "Brand not found" });
  }
});

// GET /brand/{brand_id}
server.get("/brand/:brand_id", (req, res) => {
  const { brand_id } = req.params;
  const brand = router.db.get("brand").find({ id: brand_id }).value();

  if (brand) {
    res.json({ data: brand });
  } else {
    res.status(404).json({ message: "Brand not found" });
  }
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
server.post("/brand/:brand_id/event", (req, res) => {
  const { brand_id } = req.params;
  console.log(req.body);
  const newEvent = {
    ...req.body,
    brand_id: brand_id,
    id: Date.now().toString(), // Generate a unique ID
    created_by: "user_12",
    created_at: "2022-06-10 17:09:26",
  };

  try {
    const brand = router.db.get("brand").find({ id: brand_id }).value();

    if (!brand) {
      return res
        .status(404)
        .json({ message: `Brand with id: ${brand_id} not found` });
    }

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
