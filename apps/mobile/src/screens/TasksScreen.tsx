// ------------------------------------------------------------------
// Tasks list screen — view, search, filter, create, edit, delete.
// ------------------------------------------------------------------

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/services";
import { extractErrorMessage } from "../utils/error";
import type { Task, TaskStatus, TaskPriority, Project } from "../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AppTabParamList } from "../navigation/types";

type Props = NativeStackScreenProps<AppTabParamList, "Tasks">;

const STATUS_OPTIONS: { label: string; value: TaskStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

const PRIORITY_OPTIONS: { label: string; value: TaskPriority | "" }[] = [
  { label: "All", value: "" },
  { label: "Low", value: "LOW" },
  { label: "Medium", value: "MEDIUM" },
  { label: "High", value: "HIGH" },
];

function statusDisplay(status: TaskStatus): { label: string; color: string } {
  switch (status) {
    case "PENDING":
      return { label: "Pending", color: "#94a3b8" };
    case "IN_PROGRESS":
      return { label: "In Progress", color: "#f59e0b" };
    case "COMPLETED":
      return { label: "Completed", color: "#10b981" };
    default:
      return { label: status, color: "#94a3b8" };
  }
}

function priorityDisplay(priority: TaskPriority): { label: string; color: string } {
  switch (priority) {
    case "LOW":
      return { label: "Low", color: "#3b82f6" };
    case "MEDIUM":
      return { label: "Medium", color: "#f59e0b" };
    case "HIGH":
      return { label: "High", color: "#ef4444" };
    default:
      return { label: priority, color: "#94a3b8" };
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isValidDate(dateString: string) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false;
  const d = new Date(dateString);
  const dNum = d.getTime();
  if (!dNum && dNum !== 0) return false;
  return d.toISOString().slice(0, 10) === dateString;
}

export default function TasksScreen({ navigation }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "">("");
  const [projectFilter, setProjectFilter] = useState<string>(""); // projectId

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPriority, setFormPriority] = useState<TaskPriority>("MEDIUM");
  const [formStatus, setFormStatus] = useState<TaskStatus>("PENDING");
  const [formProjectId, setFormProjectId] = useState("");
  const [formDueDate, setFormDueDate] = useState(""); // YYYY-MM-DD
  const [formError, setFormError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTasks = useCallback(
    async (opts?: { isRefresh?: boolean; searchOverride?: string }) => {
      const isRefresh = opts?.isRefresh ?? false;
      const searchValue = opts?.searchOverride ?? search;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const params: { search?: string; status?: string; priority?: string; projectId?: string } = {};
        if (searchValue.trim()) params.search = searchValue.trim();
        if (statusFilter) params.status = statusFilter;
        if (priorityFilter) params.priority = priorityFilter;
        if (projectFilter) params.projectId = projectFilter;

        const { data } = await api.tasks.getAll(params);
        setTasks(data);
        
        // Fetch projects in background so filters and forms are populated
        if (projects.length === 0) {
            const projRes = await api.projects.getAll();
            setProjects(projRes.data);
        }
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter, priorityFilter, projectFilter, projects.length],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTasks();
    }, [fetchTasks]),
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchTasks({ searchOverride: text });
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Fetch immediately on filter change
  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter, projectFilter]);

  const handleRefresh = () => fetchTasks({ isRefresh: true });

  const openCreateModal = () => {
    setEditingTask(null);
    setFormName("");
    setFormDescription("");
    setFormPriority("MEDIUM");
    setFormStatus("PENDING");
    setFormProjectId(projects.length > 0 ? projects[0].id : "");
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setFormDueDate(in7Days.toISOString().split("T")[0]);
    setFormError(null);
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormName(task.name);
    setFormDescription(task.description || "");
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormProjectId(task.projectId);
    setFormDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
    setFormError(null);
    setModalVisible(true);
  };

  const saveTask = async () => {
    if (!formName.trim()) return setFormError("Task name is required");
    if (!formProjectId) return setFormError("Project is required");
    if (!isValidDate(formDueDate)) return setFormError("Due date must be a valid date (YYYY-MM-DD)");

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        priority: formPriority,
        status: formStatus,
        dueDate: new Date(formDueDate).toISOString(),
        projectId: formProjectId,
      };

      if (editingTask) {
        await api.tasks.update(editingTask.id, payload);
      } else {
        await api.tasks.create(payload);
      }
      setModalVisible(false);
      fetchTasks();
    } catch (err) {
      setFormError(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteTask = (task: Task) => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.tasks.delete(task.id);
              fetchTasks();
            } catch (err) {
              Alert.alert("Error", extractErrorMessage(err));
            }
          },
        },
      ]
    );
  };

  const markCompleted = async (task: Task) => {
    if (task.status === "COMPLETED") return;
    try {
      await api.tasks.update(task.id, { status: "COMPLETED" });
      fetchTasks();
    } catch (err) {
      Alert.alert("Error", extractErrorMessage(err));
    }
  };

  const renderTaskItem = ({ item }: { item: Task }) => {
    const s = statusDisplay(item.status);
    const p = priorityDisplay(item.priority);
    const proj = projects.find(proj => proj.id === item.projectId);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardName, item.status === "COMPLETED" && styles.cardNameCompleted]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: s.color + "22", borderColor: s.color + "44" }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        {proj && (
          <Text style={styles.projectText}>📂 {proj.name}</Text>
        )}

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.cardInfo}>
             <View style={[styles.smallBadge, { backgroundColor: p.color + "22" }]}>
               <Text style={[styles.smallBadgeText, { color: p.color }]}>Priority: {p.label}</Text>
             </View>
             <Text style={styles.dateText}>📅 Due: {formatDate(item.dueDate)}</Text>
          </View>

          <View style={styles.cardActions}>
             {item.status !== "COMPLETED" && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => markCompleted(item)}>
                  <Text style={styles.actionTextComplete}>✅ Complete</Text>
                </TouchableOpacity>
             )}
             <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
               <Text style={styles.actionText}>Edit</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.actionBtn} onPress={() => deleteTask(item)}>
               <Text style={styles.actionTextDanger}>Delete</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TextInput
          style={[styles.searchInput, { flex: 1 }]}
          placeholder="Search tasks…"
          placeholderTextColor="#64748b"
          value={search}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.createBtn} onPress={openCreateModal}>
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <Text style={styles.filterLabel}>Status:</Text>
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <TouchableOpacity key={`status-${opt.value}`} style={[styles.chip, active && styles.chipActive]} onPress={() => setStatusFilter(opt.value)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <Text style={styles.filterLabel}>Priority:</Text>
        {PRIORITY_OPTIONS.map((opt) => {
          const active = priorityFilter === opt.value;
          return (
            <TouchableOpacity key={`priority-${opt.value}`} style={[styles.chip, active && styles.chipActive]} onPress={() => setPriorityFilter(opt.value)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {projects.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
          <Text style={styles.filterLabel}>Project:</Text>
          <TouchableOpacity style={[styles.chip, projectFilter === "" && styles.chipActive]} onPress={() => setProjectFilter("")}>
            <Text style={[styles.chipText, projectFilter === "" && styles.chipTextActive]}>All Projects</Text>
          </TouchableOpacity>
          {projects.map((proj) => {
            const active = projectFilter === proj.id;
            return (
              <TouchableOpacity key={proj.id} style={[styles.chip, active && styles.chipActive]} onPress={() => setProjectFilter(proj.id)}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{proj.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>No tasks found</Text>
        <Text style={styles.emptySubtext}>
          {search || statusFilter || priorityFilter || projectFilter
            ? "Try adjusting your filters."
            : "Create a new task to get started."}
        </Text>
      </View>
    );
  };

  if (error && tasks.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredFill}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to load tasks</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchTasks()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loading && tasks.length === 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading tasks…</Text>
            </View>
          ) : null
        }
        contentContainerStyle={[styles.list, tasks.length === 0 && !loading && styles.listEmpty]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#3b82f6" colors={["#3b82f6"]} progressBackgroundColor="#1e293b" />
        }
      />
      {error && tasks.length > 0 && (
        <View style={styles.errorBanner}><Text style={styles.errorBannerText}>{error}</Text></View>
      )}

      {/* Form Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView style={styles.modalContainer} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingTask ? "Edit Task" : "Create Task"}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.formScroll}>
            {formError && <View style={styles.formError}><Text style={styles.formErrorText}>{formError}</Text></View>}
            
            <Text style={styles.formLabel}>Task Name *</Text>
            <TextInput style={styles.formInput} value={formName} onChangeText={setFormName} placeholder="Enter task name" placeholderTextColor="#64748b" />
            
            <Text style={styles.formLabel}>Description</Text>
            <TextInput style={[styles.formInput, styles.formInputMulti]} value={formDescription} onChangeText={setFormDescription} placeholder="Optional description" placeholderTextColor="#64748b" multiline numberOfLines={3} />

            <Text style={styles.formLabel}>Project *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formChipScroll} contentContainerStyle={styles.formChipRow}>
               {projects.map(p => (
                 <TouchableOpacity key={p.id} style={[styles.chip, formProjectId === p.id && styles.chipActive]} onPress={() => setFormProjectId(p.id)}>
                   <Text style={[styles.chipText, formProjectId === p.id && styles.chipTextActive]}>{p.name}</Text>
                 </TouchableOpacity>
               ))}
            </ScrollView>

            <Text style={styles.formLabel}>Status</Text>
            <View style={styles.formChipRow}>
               {STATUS_OPTIONS.filter(o => o.value !== "").map(opt => (
                 <TouchableOpacity key={`f-stat-${opt.value}`} style={[styles.chip, formStatus === opt.value && styles.chipActive]} onPress={() => setFormStatus(opt.value as TaskStatus)}>
                   <Text style={[styles.chipText, formStatus === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Text style={styles.formLabel}>Priority</Text>
            <View style={styles.formChipRow}>
               {PRIORITY_OPTIONS.filter(o => o.value !== "").map(opt => (
                 <TouchableOpacity key={`f-pri-${opt.value}`} style={[styles.chip, formPriority === opt.value && styles.chipActive]} onPress={() => setFormPriority(opt.value as TaskPriority)}>
                   <Text style={[styles.chipText, formPriority === opt.value && styles.chipTextActive]}>{opt.label}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <Text style={styles.formLabel}>Due Date (YYYY-MM-DD) *</Text>
            <TextInput style={styles.formInput} value={formDueDate} onChangeText={setFormDueDate} placeholder="2026-12-31" placeholderTextColor="#64748b" keyboardType="numeric" />

            <TouchableOpacity style={[styles.submitBtn, saving && styles.submitBtnDisabled]} onPress={saveTask} disabled={saving}>
               {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Save Task</Text>}
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  list: { paddingBottom: 16 },
  listEmpty: { flexGrow: 1 },

  // --- Header ---
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  headerTop: { flexDirection: "row", marginBottom: 12, gap: 10 },
  searchInput: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 10, color: "#f8fafc", fontSize: 15, paddingHorizontal: 14, paddingVertical: 10 },
  createBtn: { backgroundColor: "#3b82f6", borderRadius: 10, paddingHorizontal: 16, justifyContent: "center", alignItems: "center" },
  createBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  filterScroll: { marginBottom: 10 },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  filterLabel: { color: "#64748b", fontSize: 13, fontWeight: "600", marginRight: 4 },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155" },
  chipActive: { backgroundColor: "rgba(59, 130, 246, 0.2)", borderColor: "#3b82f6" },
  chipText: { color: "#94a3b8", fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#3b82f6" },

  // --- Card ---
  card: { backgroundColor: "#1e293b", borderRadius: 12, marginHorizontal: 16, marginTop: 12, padding: 14 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#f8fafc", flex: 1, marginRight: 8 },
  cardNameCompleted: { textDecorationLine: "line-through", color: "#94a3b8" },
  projectText: { fontSize: 12, color: "#64748b", marginBottom: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: "600" },
  cardDesc: { fontSize: 13, color: "#cbd5e1", marginBottom: 12, lineHeight: 18 },
  cardFooter: { borderTopWidth: 1, borderTopColor: "#334155", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 },
  cardInfo: { gap: 6 },
  smallBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  smallBadgeText: { fontSize: 10, fontWeight: "700" },
  dateText: { fontSize: 12, color: "#94a3b8" },
  cardActions: { flexDirection: "row", gap: 8, alignItems: "center" },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { color: "#3b82f6", fontSize: 13, fontWeight: "600" },
  actionTextComplete: { color: "#10b981", fontSize: 13, fontWeight: "600" },
  actionTextDanger: { color: "#ef4444", fontSize: 13, fontWeight: "600" },

  // --- States ---
  emptyContainer: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#f8fafc", marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: "#94a3b8", textAlign: "center" },
  loadingFooter: { alignItems: "center", paddingVertical: 40 },
  loadingText: { color: "#94a3b8", fontSize: 14, marginTop: 10 },
  centeredFill: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  errorTitle: { fontSize: 18, fontWeight: "bold", color: "#f8fafc", marginBottom: 8 },
  errorMessage: { fontSize: 14, color: "#94a3b8", textAlign: "center", marginBottom: 20 },
  retryButton: { backgroundColor: "#3b82f6", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 32 },
  retryText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
  errorBanner: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(239, 68, 68, 0.9)", paddingVertical: 10, paddingHorizontal: 16 },
  errorBannerText: { color: "#ffffff", fontSize: 13, textAlign: "center" },

  // --- Modal ---
  modalContainer: { flex: 1, backgroundColor: "#0f172a" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#1e293b", backgroundColor: "#1e293b" },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#f8fafc" },
  modalClose: { fontSize: 16, color: "#3b82f6", fontWeight: "600" },
  formScroll: { padding: 16 },
  formLabel: { fontSize: 14, fontWeight: "600", color: "#94a3b8", marginBottom: 8, marginTop: 16 },
  formInput: { backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", borderRadius: 10, color: "#f8fafc", fontSize: 15, paddingHorizontal: 14, paddingVertical: 12 },
  formInputMulti: { minHeight: 80, textAlignVertical: "top" },
  formChipScroll: { marginBottom: 4 },
  formChipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  formError: { backgroundColor: "rgba(239,68,68,0.15)", borderWidth: 1, borderColor: "rgba(239,68,68,0.4)", borderRadius: 10, padding: 12, marginBottom: 10 },
  formErrorText: { color: "#fca5a5", fontSize: 13, textAlign: "center" },
  submitBtn: { backgroundColor: "#3b82f6", borderRadius: 10, padding: 16, alignItems: "center", marginTop: 30 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
