// ------------------------------------------------------------------
// Dashboard screen — displays the authenticated user's statistics.
//
// Fetches GET /api/dashboard on screen focus and on pull-to-refresh.
// The Axios interceptor attaches the JWT automatically.
// 401 responses are handled by the global AuthContext/interceptor.
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/services";
import { extractErrorMessage } from "../utils/error";
import type { DashboardStats } from "../types";

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const { data } = await api.dashboard.getStats();
      setStats(data);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch when the screen gains focus (tab switch, returning from other screen)
  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard]),
  );

  const handleRefresh = () => {
    fetchDashboard(true);
  };

  const handleRetry = () => {
    fetchDashboard();
  };

  // --- Loading state (initial) ---
  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading dashboard…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- Error state (no data to show) ---
  if (error && !stats) {
    return (
      <SafeAreaView style={styles.safe} edges={["bottom"]}>
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
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Unable to load dashboard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Data loaded ---
  const cards: { label: string; value: number; emoji: string; color: string }[] = [
    {
      label: "Total Projects",
      value: stats?.totalProjects ?? 0,
      emoji: "📁",
      color: "#3b82f6",
    },
    {
      label: "Projects In Progress",
      value: stats?.projectsInProgress ?? 0,
      emoji: "🚧",
      color: "#f59e0b",
    },
    {
      label: "Total Tasks",
      value: stats?.totalTasks ?? 0,
      emoji: "📋",
      color: "#8b5cf6",
    },
    {
      label: "Completed Tasks",
      value: stats?.completedTasks ?? 0,
      emoji: "✅",
      color: "#10b981",
    },
    {
      label: "Pending Tasks",
      value: stats?.pendingTasks ?? 0,
      emoji: "⏳",
      color: "#ef4444",
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
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
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Welcome, {user?.fullName?.split(" ")[0] ?? "User"} 👋
          </Text>
          <Text style={styles.greetingSubtext}>
            Here's an overview of your projects and tasks.
          </Text>
        </View>

        {/* Error banner (when we have stale data but latest fetch failed) */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Stat Cards */}
        <View style={styles.cardGrid}>
          {cards.map((card) => (
            <View
              key={card.label}
              style={[styles.card, { borderLeftColor: card.color }]}
            >
              <Text style={styles.cardEmoji}>{card.emoji}</Text>
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  centered: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 15,
    marginTop: 12,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },

  // --- Greeting ---
  greeting: {
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },

  // --- Error (full screen) ---
  errorIcon: {
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
    paddingHorizontal: 16,
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

  // --- Cards ---
  cardGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#f8fafc",
    marginRight: 10,
    minWidth: 36,
  },
  cardLabel: {
    fontSize: 15,
    color: "#94a3b8",
    flexShrink: 1,
  },

  // --- Logout ---
  logoutButton: {
    marginTop: 28,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  logoutText: {
    color: "#fca5a5",
    fontSize: 15,
    fontWeight: "600",
  },
});
