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

async function getAuthToken() {
  const session =
    await fetchAuthSession();

  const token =
    session.tokens?.idToken?.toString();

  if (!token) {
    throw new Error(
      "No hay sesión activa"
    );
  }

  return token;
}

export async function getCurrentUserFromApi() {
  const token =
    await getAuthToken();

  const response = await fetch(
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

export async function getOrganizationFromApi() {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/organization`,
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

export async function getMembersFromApi() {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/members`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Backend error ${response.status}`
    );
  }

  return data;
}

export async function addMemberToApi(
  email: string
) {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Backend error ${response.status}`
    );
  }

  return data;
}

export async function updateMemberRoleToApi(
  memberId: string,
  role: "ADMIN" | "MEMBER"
) {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/members/${memberId}/role`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Backend error ${response.status}`
    );
  }

  return data;
}

export async function getInvitationsFromApi() {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/invitations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Backend error ${response.status}`
    );
  }

  return data;
}

export async function acceptInvitationToApi(
  invitationId: string
) {
  const token =
    await getAuthToken();

  const response = await fetch(
    `${API.BASE_URL}/invitations/accept`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invitationId,
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Backend error ${response.status}`
    );
  }

  return data;
}
