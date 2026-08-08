import { API } from "@/config/api";

import {
  signUp,
  confirmSignUp,
  signIn,
  signOut,
  fetchAuthSession,
} from "aws-amplify/auth";

export async function registerUser(
  email: string,
  password: string
) {
  return await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
      },
    },
  });
}

export async function confirmUser(
  email: string,
  code: string
) {
  return await confirmSignUp({
    username: email,
    confirmationCode: code,
  });
}

export async function loginUser(
  email: string,
  password: string
) {
  try {
    await signOut();
  } catch {}

  return await signIn({
    username: email,
    password,
  });
}

export async function logoutUser() {
  await signOut();
}

export async function getCurrentUserFromApi() {

  const session =
    await fetchAuthSession();

  const token =
    session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error("No hay sesión activa");
  }

  const response =
    await fetch(
      `${API.BASE_URL}/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

  if (!response.ok) {

    const errorText =
      await response.text();

    throw new Error(
      `Backend error ${response.status}: ${errorText}`
    );
  }

  return await response.json();
}
