// ------------------------------------------------------------------
// Navigation type definitions for React Navigation.
// ------------------------------------------------------------------

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Dashboard: undefined;
  Projects: undefined;
  Tasks: undefined;
};

export type ProjectStackParamList = {
  ProjectList: undefined;
  ProjectDetail: { projectId: string };
};
