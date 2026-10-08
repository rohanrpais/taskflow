// ------------------------------------------------------------------
// Project detail screen — fetches and displays a single project.
//
// Receives projectId via route params, calls GET /api/projects/:id.
// The backend does NOT include tasks in the project response,
// so only project details are shown here. Tasks come in P8.5.
// ------------------------------------------------------------------

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../api/services";
import { extractErrorMessage } from "../utils/error";
import type { Project, ProjectStatus } from "../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProjectStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ProjectStackParamList, "ProjectDetail">;

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectDetailScreen({ route }: Props) {
  const { projectId } = route.params;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const { data } = await api.projects.getById(projectId);
        setProject(data);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId],
  );

  useFocusEffect(
    useCallback(() => {
      fetchProject();
    }, [fetchProject]),
  );

  const handleRefresh = () => {
    fetchProject(true);
  };

  // --- Loading ---
  if (loading && !project) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading project…</Text>
      </View>
    );
  }

  // --- Error (no data) ---
  if (error && !project) {
    return (
      <ScrollView
        contentContainerStyle={styles.centered}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
            colors={["#3b82f6"]}
            progressBackgroundColor="#1e293b"
          />
        }
      >
        <Text style={styles.emptyIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Unable to load project</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchProject()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (!project) return null;

  const s = statusDisplay(project.status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
          colors={["#3b82f6"]}
          progressBackgroundColor="#1e293b"
        />
      }
    >
      {/* Error banner (stale data) */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Project name + status */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{project.name}</Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: s.color + "22", borderColor: s.color + "44" },
          ]}
        >
          <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
        </View>
      </View>

      {/* Description */}
      {project.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{project.description}</Text>
        </View>
      ) : null}

      {/* Details grid */}
      <View style={styles.detailsCard}>
        <DetailRow label="Start Date" value={formatDate(project.startDate)} emoji="📅" />
        <DetailRow label="End Date" value={formatDate(project.endDate)} emoji="🏁" />
        <DetailRow label="Created" value={formatDate(project.createdAt)} emoji="🕐" />
        <DetailRow label="Status" value={s.label} emoji="📊" />
      </View>

      {/* Placeholder for tasks (P8.5) */}
      <View style={styles.tasksPlaceholder}>
        <Text style={styles.tasksPlaceholderIcon}>📋</Text>
        <Text style={styles.tasksPlaceholderText}>
          Tasks for this project will be available in the Tasks tab.
        </Text>
      </View>
    </ScrollView>
  );
}

function DetailRow({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.emoji}>{emoji}</Text>
      <View style={detailStyles.textCol}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  emoji: {
    fontSize: 20,
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    color: "#f8fafc",
    fontWeight: "500",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 24,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 12,
  },

  // --- Title ---
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc",
    flexShrink: 1,
    marginRight: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // --- Description ---
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 15,
    color: "#cbd5e1",
    lineHeight: 22,
  },

  // --- Details card ---
  detailsCard: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 4,
    marginBottom: 20,
  },

  // --- Tasks placeholder ---
  tasksPlaceholder: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  tasksPlaceholderIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  tasksPlaceholderText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },

  // --- Error ---
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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

  // --- Error banner ---
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.4)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    color: "#fca5a5",
    fontSize: 13,
    textAlign: "center",
  },
});
