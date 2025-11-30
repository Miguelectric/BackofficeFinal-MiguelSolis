const API_BASE = "https://portfolio-api-three-black.vercel.app/api/v1";
const token = localStorage.getItem("authToken");

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const res = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al iniciar sesión");
            return;
        }

        localStorage.setItem("authToken", data.token);
        window.location.href = "home.html";
    });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = {
            name: document.getElementById("regName").value,
            email: document.getElementById("regEmail").value,
            itsonId: document.getElementById("regItson").value,
            password: document.getElementById("regPassword").value
        };

        const res = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || "Error al registrar");
            return;
        }

        alert("Usuario registrado con éxito");
        window.location.href = "login.html";
    });
}

if (window.location.pathname.includes("home.html") && !token) {
    window.location.href = "login.html";
}

const modal = document.getElementById("modal");
const openFormBtn = document.getElementById("openFormBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let editingProjectId = null;

if (modal) {
    openFormBtn.onclick = () => {
        editingProjectId = null;
        projectForm.reset();
        modal.classList.remove("hidden");
    };

    closeModalBtn.onclick = () => modal.classList.add("hidden");
}

async function loadProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

    const res = await fetch(`${API_BASE}/projects`, {
        headers: { "auth-token": token }
    });

    const projects = await res.json();
    container.innerHTML = "";

    projects.forEach(p => {
        const img = p.images?.length ? p.images[0] : "";

        const card = document.createElement("div");
        card.className = "project-card";

        card.innerHTML = `
            ${img ? `<img src="${img}" class="card-img">` : ""}
            <h3>${p.title}</h3>
            <p>${p.description.substring(0, 80)}...</p>

            <div class="card-actions">
                <button class="view" data-id="${p._id}">Ver más</button>
                <button class="edit" data-id="${p._id}">Editar</button>
                <button class="delete" data-id="${p._id}">Eliminar</button>
            </div>
        `;

        container.appendChild(card);
    });

    document.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => deleteProject(btn.dataset.id));
    });

    document.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", () => openEdit(btn.dataset.id));
    });

    document.querySelectorAll(".view").forEach(btn => {
        btn.addEventListener("click", () => openDetails(btn.dataset.id));
    });
}

if (window.location.pathname.includes("home.html")) {
    loadProjects();
}

async function openEdit(id) {
    editingProjectId = id;

    const res = await fetch(`${API_BASE}/projects/${id}`, {
        headers: { "auth-token": token }
    });

    const p = await res.json();

    document.getElementById("title").value = p.title;
    document.getElementById("description").value = p.description;
    document.getElementById("technologies").value = p.technologies.join(", ");
    document.getElementById("repository").value = p.repository || "";

    document.getElementById("imageUrl").value =
        p.images?.length ? p.images[0] : "";

    modal.classList.remove("hidden");
}

const projectForm = document.getElementById("projectForm");
if (projectForm) {
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const image = document.getElementById("imageUrl").value;

        const project = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            technologies: document.getElementById("technologies").value
                .split(",")
                .map(t => t.trim()),
            repository: document.getElementById("repository").value,
            images: image ? [image] : []
        };

        let method = "POST";
        let url = `${API_BASE}/projects`;

        if (editingProjectId) {
            method = "PUT";
            url = `${API_BASE}/projects/${editingProjectId}`;
        }

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "auth-token": token
            },
            body: JSON.stringify(project)
        });

        editingProjectId = null;
        modal.classList.add("hidden");
        loadProjects();
    });
}

async function deleteProject(id) {
    if (!confirm("¿Eliminar proyecto?")) return;

    await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
        headers: { "auth-token": token }
    });

    loadProjects();
}

async function openDetails(id) {
    const res = await fetch(`${API_BASE}/projects/${id}`, {
        headers: { "auth-token": token }
    });

    const p = await res.json();

    document.getElementById("detailsTitle").innerText = p.title;
    document.getElementById("detailsDesc").innerText = p.description;
    document.getElementById("detailsTech").innerText = p.technologies.join(", ");
    document.getElementById("detailsRepo").href = p.repository || "#";

    if (p.images?.length) {
        document.getElementById("detailsImg").src = p.images[0];
        document.getElementById("detailsImg").style.display = "block";
    } else {
        document.getElementById("detailsImg").style.display = "none";
    }

    document.getElementById("detailsModal").classList.remove("hidden");
}

document.getElementById("closeDetailsBtn").onclick = () =>
    document.getElementById("detailsModal").classList.add("hidden");

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("authToken");
        window.location.href = "login.html";
    });
}
