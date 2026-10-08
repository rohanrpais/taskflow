// ------------------------------------------------------------------
// App tabs — shown to authenticated users.
//
// Bottom tabs: Dashboard, Projects (with nested stack), Tasks.
// ------------------------------------------------------------------

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DashboardScreen from "../screens/DashboardScreen";
import ProjectsScreen from "../screens/ProjectsScreen";
import ProjectDetailScreen from "../screens/ProjectDetailScreen";
import TasksScreen from "../screens/TasksScreen";
import type { AppTabParamList, ProjectStackParamList } from "./types";

// Projects has a nested stack so we can push ProjectDetail
const ProjStack = createNativeStackNavigator<ProjectStackParamList>();

function ProjectsStack() {
  return (
    <ProjStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#f8fafc",
      }}
    >
      <ProjStack.Screen
        name="ProjectList"
        component={ProjectsScreen}
        options={{ title: "Projects" }}
      />
      <ProjStack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{ title: "Project Details" }}
      />
    </ProjStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<AppTabParamList>();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#1e293b" },
        headerTintColor: "#f8fafc",
        tabBarStyle: { backgroundColor: "#1e293b", borderTopColor: "#334155" },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#94a3b8",
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen
        name="Projects"
        component={ProjectsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} />
    </Tab.Navigator>
  );
}
