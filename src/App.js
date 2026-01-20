import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  BottomNavigation,
  BottomNavigationAction,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Badge,
  Collapse,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const STORAGE_KEY = "todo_app_data_v4";

function todayString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  return dueDate < todayString();
}

function daysFromToday(dueDate) {
  if (!dueDate) return null;
  const today = new Date(todayString());
  const due = new Date(dueDate);
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export default function App() {
  // ---------- Load from LocalStorage ----------
  const [lists, setLists] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.lists || [];
    } catch {
      return [];
    }
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return parsed.tasks || [];
    } catch {
      return [];
    }
  });

  const [selectedListId, setSelectedListId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "";
    try {
      const parsed = JSON.parse(saved);
      return parsed.selectedListId || "";
    } catch {
      return "";
    }
  });

  // Page = Home / Tasks / Profile
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "tasks";
    try {
      const parsed = JSON.parse(saved);
      return parsed.page || "tasks";
    } catch {
      return "tasks";
    }
  });

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return false;
    try {
      const parsed = JSON.parse(saved);
      return parsed.darkMode || false;
    } catch {
      return false;
    }
  });

  // App name
  const [appName, setAppName] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return "To-Do";
    try {
      const parsed = JSON.parse(saved);
      return parsed.appName || "To-Do";
    } catch {
      return "To-Do";
    }
  });

  // ---------- Save to LocalStorage ----------
  useEffect(() => {
    const payload = {
      lists,
      tasks,
      selectedListId,
      page,
      appName,
      darkMode,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [lists, tasks, selectedListId, page, appName, darkMode]);

  // ---------- THEME COLORS ----------
  const theme = useMemo(() => {
    return {
      bg: darkMode ? "#121212" : "#f2f2f2",
      card: darkMode ? "#1e1e1e" : "#ffffff",
      cardAlt: darkMode ? "#181818" : "#fafafa",
      border: darkMode ? "#333" : "#e5e5e5",
      text: darkMode ? "#f5f5f5" : "#111",
      subText: darkMode ? "#bdbdbd" : "#666",
      appBar: darkMode ? "#1b1b1b" : "#2b2b2b",
      primary: "#4dabf7",      // light blue accent
      primaryHover: "#339af0", // slightly darker on hover

    };
  }, [darkMode]);

  // ---------- UI States ----------
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navValue, setNavValue] = useState(() => {
    if (page === "home") return 0;
    if (page === "tasks") return 1;
    return 2;
  });

  // Create list
  const [newListName, setNewListName] = useState("");

  // Add tasks
  const [taskText, setTaskText] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  // Filter tasks
  const [filter, setFilter] = useState("all"); // all | active | completed

  // Expand task details
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const selectedListName = lists.find((l) => l.id === selectedListId)?.name;

  // ---------- List Functions ----------
  function createList() {
    if (newListName.trim() === "") return;

    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
    };

    setLists([newList, ...lists]);
    setSelectedListId(newList.id);
    setNewListName("");
  }

  function deleteList(listId) {
    setLists(lists.filter((l) => l.id !== listId));
    setTasks(tasks.filter((t) => t.listId !== listId));

    if (selectedListId === listId) {
      setSelectedListId("");
      setExpandedTaskId(null);
    }
  }

  function countRemainingForList(listId) {
    return tasks.filter((t) => t.listId === listId && !t.done).length;
  }

  // ---------- Task Functions ----------
  function addTask() {
    if (!selectedListId) return;
    if (taskText.trim() === "") return;

    const newTask = {
      id: Date.now(),
      listId: selectedListId,
      text: taskText.trim(),
      done: false,
      dueDate: taskDueDate,
      subtasks: [],
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setTaskText("");
    setTaskDueDate("");
  }

  function toggleTask(taskId) {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  }

  function deleteTask(taskId) {
    setTasks(tasks.filter((t) => t.id !== taskId));
    if (expandedTaskId === taskId) setExpandedTaskId(null);
  }

  function clearCompleted() {
    setTasks(tasks.filter((t) => !(t.listId === selectedListId && t.done)));
  }

  function updateTaskDueDate(taskId, newDate) {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, dueDate: newDate } : t)));
  }

  // ---------- Subtasks ----------
  function addSubtask(taskId, subtaskText) {
    if (subtaskText.trim() === "") return;

    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;

        const newSub = {
          id: Date.now(),
          text: subtaskText.trim(),
          done: false,
        };

        return { ...t, subtasks: [newSub, ...(t.subtasks || [])] };
      })
    );
  }

  function toggleSubtask(taskId, subId) {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;

        const updated = (t.subtasks || []).map((s) =>
          s.id === subId ? { ...s, done: !s.done } : s
        );

        return { ...t, subtasks: updated };
      })
    );
  }

  function deleteSubtask(taskId, subId) {
    setTasks(
      tasks.map((t) => {
        if (t.id !== taskId) return t;

        const updated = (t.subtasks || []).filter((s) => s.id !== subId);
        return { ...t, subtasks: updated };
      })
    );
  }

  // ---------- Filtered Tasks ----------
  const listTasks = useMemo(() => {
    return tasks
      .filter((t) => t.listId === selectedListId)
      .filter((t) => {
        if (filter === "active") return !t.done;
        if (filter === "completed") return t.done;
        return true;
      });
  }, [tasks, selectedListId, filter]);

  const remaining = tasks.filter((t) => t.listId === selectedListId && !t.done).length;
  const completed = tasks.filter((t) => t.listId === selectedListId && t.done).length;

  // ---------- Home dashboard data ----------
  const overdueTasks = tasks.filter((t) => !t.done && isOverdue(t.dueDate));
  const dueSoonTasks = tasks.filter((t) => {
    if (t.done || !t.dueDate) return false;
    const d = daysFromToday(t.dueDate);
    return d !== null && d >= 0 && d <= 3;
  });

  const totalRemaining = tasks.filter((t) => !t.done).length;

  // ---------- Bottom Nav behavior ----------
  function goHome() {
    setPage("home");
    setNavValue(0);
  }

  function goLists() {
    setDrawerOpen(true);
    setPage("tasks");
    setNavValue(1);
  }

  function goProfile() {
    setPage("profile");
    setNavValue(2);
  }

  function clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    setLists([]);
    setTasks([]);
    setSelectedListId("");
    setExpandedTaskId(null);
    setPage("tasks");
    setNavValue(1);
    setAppName("To-Do");
    setDarkMode(false);
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: theme.bg, pb: 9 }}>
      {/* TOP BAR */}
      <AppBar position="static" sx={{ bgcolor: theme.appBar }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ flexGrow: 1,
          textTransform: "none",
          fontWeight: 800,
           }}>
            {appName}
          </Typography>

          <Button color="inherit" onClick={goHome}
          sx={{
            textTransform: "none",
            fontWeight: 800,
          }}
          >
            Dashboard
          </Button>
        </Toolbar>
      </AppBar>

      {/* SIDE DRAWER */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 300, p: 2, bgcolor: theme.card, minHeight: "100%" }}>
          <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
            My Lists
          </Typography>

          {/* Create List */}
          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createList();
              }}
              sx={{
                input: { color: theme.text },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
              }}
            />
            <Button
              variant="contained"
              onClick={createList}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: theme.primary,
                fontWeight: 800,
                "&:hover": { bgcolor: theme.primaryHover },
              }}
            >
              Add
            </Button>
          </Box>

          <Divider sx={{ mb: 2, borderColor: theme.border }} />

          {/* Lists */}
          {lists.length === 0 ? (
            <Typography sx={{ color: theme.subText, fontSize: 13 }}>
              No lists yet. Create your first one above.
            </Typography>
          ) : (
            <List dense>
              {lists.map((list) => (
                <ListItem
                  key={list.id}
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" onClick={() => deleteList(list.id)} title="Delete list">
                      <DeleteIcon sx={{ color: theme.subText }} />
                    </IconButton>
                  }
                >
                  <ListItemButton
                    selected={selectedListId === list.id}
                    onClick={() => {
                      setSelectedListId(list.id);
                      setDrawerOpen(false);
                      setExpandedTaskId(null);
                      setPage("tasks");
                      setNavValue(1);
                    }}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      color: theme.text,
                      "&.Mui-selected": {
                        bgcolor: darkMode ? "#2b2b2b" : "#eaeaea",
                      },
                    }}
                  >
                    <ListItemText primary={list.name} />
                    <Badge color="error" badgeContent={countRemainingForList(list.id)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}

          <Divider sx={{ mt: 2, borderColor: theme.border }} />

          <Typography sx={{ fontSize: 12, color: theme.subText, mt: 2 }}>
            Tip: Use Home for overdue + due soon.
          </Typography>
        </Box>
      </Drawer>

      {/* MAIN CONTENT */}
      <Container maxWidth="sm" sx={{ mt: 3 }}>
        {/* HOME PAGE */}
        {page === "home" && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: theme.text }}>
              Dashboard
            </Typography>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  Overview
                </Typography>
                <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                  Total lists: {lists.length}
                </Typography>
                <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                  Remaining tasks: {totalRemaining}
                </Typography>
                <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                  Overdue tasks: {overdueTasks.length}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  Overdue
                </Typography>
                {overdueTasks.length === 0 ? (
                  <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                    Nothing overdue
                  </Typography>
                ) : (
                  overdueTasks.slice(0, 5).map((t) => (
                    <Paper
                      key={t.id}
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: theme.cardAlt,
                        borderColor: theme.border,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
                        {t.text}
                      </Typography>
                      <Chip size="small" color="error" label={`Overdue: ${t.dueDate}`} sx={{ mt: 0.5 }} />
                    </Paper>
                  ))
                )}
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  Due Soon (next 3 days)
                </Typography>
                {dueSoonTasks.length === 0 ? (
                  <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                    Nothing due soon.
                  </Typography>
                ) : (
                  dueSoonTasks.slice(0, 5).map((t) => (
                    <Paper
                      key={t.id}
                      variant="outlined"
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        mb: 1,
                        bgcolor: theme.cardAlt,
                        borderColor: theme.border,
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
                        {t.text}
                      </Typography>
                      <Chip size="small" variant="outlined" label={`Due: ${t.dueDate}`} sx={{ mt: 0.5 }} />
                    </Paper>
                  ))
                )}
              </CardContent>
            </Card>

            <Button
              variant="contained"
              onClick={goLists}
              sx={{
                bgcolor: theme.primary,
                fontWeight: 900,
                "&:hover": { bgcolor: theme.primaryHover },
              }}
            >
              Go to Lists
            </Button>
          </>
        )}

        {/* TASKS PAGE */}
        {page === "tasks" && (
          <>
            {lists.length === 0 ? (
              <Card sx={{ bgcolor: theme.card }}>
                <CardContent>
                  <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                    Welcome to your To-Do App
                  </Typography>
                  <Typography sx={{ color: theme.subText, fontSize: 14, mb: 2 }}>
                    Start by creating a list using the Lists button below (or the menu).
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={goLists}
                    sx={{
                      bgcolor: theme.primary,
                      fontWeight: 900,
                      "&:hover": { bgcolor: theme.primaryHover },
                    }}
                  >
                    Create a List
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <Typography variant="h5" sx={{ fontWeight: 900, mb: 2, color: theme.text }}>
                  {selectedListName ? `${selectedListName}` : "Choose a list"}
                </Typography>

                <Card sx={{ mb: 2, bgcolor: theme.card }}>
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography sx={{ fontWeight: 900, color: theme.text }}>
                        Tasks {selectedListId ? `(${remaining} remaining)` : ""}
                      </Typography>

                      <Button size="small" onClick={clearCompleted} sx={{ fontWeight: 800 }}>
                        Clear Completed
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={
                          selectedListId
                            ? `Add a task to ${selectedListName || "this list"}...`
                            : "Select a list to add tasks..."
                        }
                        value={taskText}
                        onChange={(e) => setTaskText(e.target.value)}
                        disabled={!selectedListId}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTask();
                        }}
                        sx={{
                          input: { color: theme.text },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
                        }}
                      />

                      <TextField
                        size="small"
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        sx={{
                          minWidth: 170,
                          input: { color: theme.text },
                          "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
                        }}
                        disabled={!selectedListId}
                      />

                      <Button
                        variant="contained"
                        onClick={addTask}
                        startIcon={<AddIcon />}
                        disabled={!selectedListId}
                        sx={{
                          bgcolor: theme.primary,
                          fontWeight: 900,
                          "&:hover": { bgcolor: theme.primaryHover },
                        }}
                      >
                        Add
                      </Button>
                    </Box>

                    <Typography sx={{ fontSize: 12, color: theme.subText, mb: 2 }}>
                      Due date is optional.
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                      <Chip
                        label="All"
                        clickable
                        onClick={() => setFilter("all")}
                        color={filter === "all" ? "primary" : "default"}
                      />
                      <Chip
                        label="Active"
                        clickable
                        onClick={() => setFilter("active")}
                        color={filter === "all" ? "primary" : "default"}
                      />
                      <Chip
                        label="Completed"
                        clickable
                        onClick={() => setFilter("completed")}
                        color={filter === "all" ? "primary" : "default"}
                      />
                    </Box>

                    <Divider sx={{ mb: 2, borderColor: theme.border }} />

                    {!selectedListId ? (
                      <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                        Tap “Lists” and pick a list from the drawer.
                      </Typography>
                    ) : listTasks.length === 0 ? (
                      <Typography sx={{ color: theme.subText, fontSize: 14 }}>
                        No tasks yet.
                      </Typography>
                    ) : (
                      listTasks.map((task) => {
                        const open = expandedTaskId === task.id;
                        const overdue = !task.done && isOverdue(task.dueDate);

                        return (
                          <Box key={task.id} sx={{ mb: 1 }}>
                            <Paper
                              variant="outlined"
                              sx={{
                                borderRadius: 2,
                                p: 1.2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                bgcolor: theme.cardAlt,
                                borderColor: theme.border,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  cursor: "pointer",
                                  flex: 1,
                                }}
                                onClick={() => setExpandedTaskId(open ? null : task.id)}
                              >
                                <Box onClick={(e) => e.stopPropagation()}>
                                  <IconButton onClick={() => toggleTask(task.id)} size="small">
                                    {task.done ? (
                                      <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                                    ) : (
                                      <RadioButtonUncheckedIcon sx={{ color: theme.subText }} />
                                    )}
                                  </IconButton>
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 800,
                                      textDecoration: task.done ? "line-through" : "none",
                                      color: task.done ? theme.subText : theme.text,
                                      fontSize: 14,
                                    }}
                                  >
                                    {task.text}
                                  </Typography>

                                  <Box sx={{ display: "flex", gap: 1, mt: 0.4, flexWrap: "wrap" }}>
                                    {task.dueDate ? (
                                      <Chip
                                        size="small"
                                        label={overdue ? `Overdue: ${task.dueDate}` : `Due: ${task.dueDate}`}
                                        color={overdue ? "error" : "default"}
                                        variant={overdue ? "filled" : "outlined"}
                                      />
                                    ) : (
                                      <Chip size="small" label="No due date" variant="outlined" />
                                    )}

                                    {(task.subtasks || []).length > 0 && (
                                      <Chip
                                        size="small"
                                        variant="outlined"
                                        label={`Subtasks: ${(task.subtasks || []).filter(s => s.done).length}/${(task.subtasks || []).length}`}
                                      />
                                    )}
                                  </Box>
                                </Box>

                                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </Box>

                              <IconButton onClick={() => deleteTask(task.id)}>
                                <DeleteIcon sx={{ color: theme.subText }} />
                              </IconButton>
                            </Paper>

                            <Collapse in={open} timeout="auto" unmountOnExit>
                              <Box
                                sx={{
                                  mt: 1,
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: `1px solid ${theme.border}`,
                                  bgcolor: theme.cardAlt,
                                }}
                              >
                                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                                  Task Details
                                </Typography>

                                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
                                  <Typography sx={{ fontSize: 13, color: theme.subText }}>
                                    Due Date:
                                  </Typography>
                                  <TextField
                                    size="small"
                                    type="date"
                                    value={task.dueDate || ""}
                                    onChange={(e) => updateTaskDueDate(task.id, e.target.value)}
                                    sx={{
                                      minWidth: 170,
                                      input: { color: theme.text },
                                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
                                    }}
                                  />
                                  <Button size="small" onClick={() => updateTaskDueDate(task.id, "")}>
                                    Remove Date
                                  </Button>
                                </Box>

                                <Divider sx={{ mb: 2, borderColor: theme.border }} />

                                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                                  Subtasks
                                </Typography>

                                <SubtaskEditor onAdd={(txt) => addSubtask(task.id, txt)} theme={theme} />

                                {(task.subtasks || []).length === 0 ? (
                                  <Typography sx={{ fontSize: 13, color: theme.subText, mt: 1 }}>
                                    No subtasks yet.
                                  </Typography>
                                ) : (
                                  <Box sx={{ mt: 1 }}>
                                    {(task.subtasks || []).map((sub) => (
                                      <Paper
                                        key={sub.id}
                                        variant="outlined"
                                        sx={{
                                          borderRadius: 2,
                                          p: 1,
                                          mb: 1,
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          bgcolor: theme.card,
                                          borderColor: theme.border,
                                        }}
                                      >
                                        <Box
                                          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", flex: 1 }}
                                          onClick={() => toggleSubtask(task.id, sub.id)}
                                        >
                                          {sub.done ? (
                                            <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                                          ) : (
                                            <RadioButtonUncheckedIcon sx={{ color: theme.subText }} />
                                          )}

                                          <Typography
                                            sx={{
                                              fontWeight: 800,
                                              fontSize: 13,
                                              textDecoration: sub.done ? "line-through" : "none",
                                              color: sub.done ? theme.subText : theme.text,
                                            }}
                                          >
                                            {sub.text}
                                          </Typography>
                                        </Box>

                                        <IconButton onClick={() => deleteSubtask(task.id, sub.id)} size="small">
                                          <DeleteIcon fontSize="small" sx={{ color: theme.subText }} />
                                        </IconButton>
                                      </Paper>
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        );
                      })
                    )}

                    {selectedListId && (
                      <Typography sx={{ mt: 2, fontSize: 13, color: theme.subText }}>
                        Completed: {completed} • Remaining: {remaining}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* PROFILE PAGE */}
        {page === "profile" && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 900, mb: 2, color: theme.text }}>
              Settings
            </Typography>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  Appearance
                </Typography>

                <FormControlLabel
                  control={
                    <Switch
                      checked={darkMode}
                      onChange={() => setDarkMode(!darkMode)}
                    />
                  }
                  label="Dark Mode"
                />

                <Typography sx={{ fontSize: 12, color: theme.subText, mt: 1 }}>
                  Dark mode will stay enabled after refresh.
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  App Name
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="To-Do"
                  sx={{
                    input: { color: theme.text },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
                  }}
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 2, bgcolor: theme.card }}>
              <CardContent>
                <Typography sx={{ fontWeight: 900, mb: 1, color: theme.text }}>
                  Data
                </Typography>

                <Typography sx={{ color: theme.subText, fontSize: 14, mb: 2 }}>
                  Lists: {lists.length} • Tasks: {tasks.length}
                </Typography>

                <Button
                  variant="contained"
                  onClick={clearAllData}
                  sx={{
                    bgcolor: theme.primary,
                    fontWeight: 900,
                    "&:hover": { bgcolor: theme.primaryHover },
                  }}
                >
                  Reset Everything
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </Container>

      {/* BOTTOM NAV */}
<Box
  sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    borderTop: `1px solid ${theme.border}`,
  }}
>
  <BottomNavigation
    value={navValue}
    onChange={(e, newValue) => {
      setNavValue(newValue);
      if (newValue === 0) setPage("home");
      if (newValue === 1) {
        setDrawerOpen(true);
        setPage("tasks");
      }
      if (newValue === 2) setPage("profile");
    }}
    sx={{
      bgcolor: darkMode ? "#1b1b1b" : "#ffffff",
      "& .MuiBottomNavigationAction-root": {
        color: darkMode ? "#aaaaaa" : "#666666",
      },
      "& .Mui-selected": {
        color: theme.primary,
      },
    }}
    >
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Lists" icon={<ListAltIcon />} />
      <BottomNavigationAction color="White" label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Box>

    </Box>
  );
}

function SubtaskEditor({ onAdd, theme }) {
  const [text, setText] = useState("");

  function handleAdd() {
    if (text.trim() === "") return;
    onAdd(text);
    setText("");
  }

  return (
    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
      <TextField
        size="small"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a subtask..."
        onKeyDown={(e) => {
          if (e.key === "Enter") handleAdd();
        }}
        sx={{
          input: { color: theme.text },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.border },
        }}
      />
      <Button variant="contained" onClick={handleAdd} startIcon={<AddIcon />}>
        Add
      </Button>
    </Box>
  );
}
