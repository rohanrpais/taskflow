// ------------------------------------------------------------------
// Projects list screen — search, status filter, pull-to-refresh.
//
// Fetches GET /api/projects with optional ?search=&status= query params.
// Tapping a project navigates to ProjectDetail with the project ID.
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
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/services";
import { extractErrorMessage } from "../utils/error";
import type { Project, ProjectStatus } from "../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectList">;

const STATUS_OPTIONS: { label: string; value: ProjectStatus | "" }[] = [
  { label: "All", value: "" },
  { label: "Not Started", value: "NOT_STARTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
];

/** Map backend enum to display label + colour */
function statusDisplay(status: ProjectStatus): { label: string; color: string } {
  switch (status) {
    case "NOT_STARTED":
      return { label: "Not Started", color: "#94a3b8" };
    case "IN_PROGRESS":
      return { label: "In Progress", color: "#f59e0b" };
    case "COMPLETED":
      return { label: "Completed", color: "#10b981" };
    default:
      return { label: status, color: "#94a3b8" };
  }
}

/** Format ISO date string to readable short date */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectsScreen({ navigation }: Props) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "">("");

  // Debounce search — keep a timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchProjects = useCallback(
    async (opts?: { isRefresh?: boolean; searchOverride?: string }) => {
      const isRefresh = opts?.isRefresh ?? false;
      const searchValue = opts?.searchOverride ?? search;

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params: { search?: string; status?: string } = {};
        if (searchValue.trim()) params.search = searchValue.trim();
        if (statusFilter) params.status = statusFilter;

        const { data } = await api.projects.getAll(params);
        setProjects(data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter],
  );

  // Fetch on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchProjects();
    }, [fetchProjects]),
  );

  // Debounced search handler
  const handleSearchChange = (text: string) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProjects({ searchOverride: text });
    }, 400);
  };

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Status filter change — immediate fetch
  const handleStatusChange = (value: ProjectStatus | "") => {
    setStatusFilter(value);
    // fetchProjects will re-run via useFocusEffect dependency change,
    // but we also want an immediate fetch for responsiveness
  };

  // When statusFilter changes, fetch immediately
  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleRefresh = () => {
    fetchProjects({ isRefresh: true });
  };

  // --- Render helpers ---

  const renderProjectItem = ({ item }: { item: Project }) => {
    const s = statusDisplay(item.status);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate("ProjectDetail", { projectId: item.id })
        }
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={[styles.badge, { backgroundColor: s.color + "22", borderColor: s.color + "44" }]}>
            <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
          </View>
        </View>

        {item.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardDates}>
          <Text style={styles.dateText}>
            {formatDate(item.startDate)} — {formatDate(item.endDate)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📂</Text>
        <Text style={styles.emptyTitle}>No projects found</Text>
        <Text style={styles.emptySubtext}>
          {search || statusFilter
            ? "Try adjusting your search or filter."
            : "Create a project from the web app to see it here."}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search projects…"
        placeholderTextColor="#64748b"
        value={search}
        onChangeText={handleSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {/* Status filter chips */}
      <View style={styles.filterRow}>
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => handleStatusChange(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  // --- Error state (no projects loaded yet) ---
  if (error && projects.length === 0 && !loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.centeredFill}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to load projects</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchProjects()}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={renderProjectItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          loading && projects.length === 0 ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading projects…</Text>
            </View>
          ) : null
        }
        contentContainerStyle={[
          styles.list,
          projects.length === 0 && !loading && styles.listEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
            progressBackgroundColor="#1e293b"
          />
        }
      />

      {/* Inline error banner when we have stale data */}
      {error && projects.length > 0 && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  list: {
    paddingBottom: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },

  // --- Header (search + filter) ---
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    color: "#f8fafc",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
  },
  chipActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    borderColor: "#3b82f6",
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#3b82f6",
  },

  // --- Project card ---
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    padding: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    flexShrink: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 8,
    lineHeight: 18,
  },
  cardDates: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#64748b",
  },

  // --- Empty state ---
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },

  // --- Loading ---
  loadingFooter: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 10,
  },

  // --- Error (full) ---
  centeredFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },

  // --- Error banner (inline) ---
  errorBanner: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  errorBannerText: {
    color: "#ffffff",
    fontSize: 13,
    textAlign: "center",
  },
});
