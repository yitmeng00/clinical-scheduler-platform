import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
} from "@microsoft/signalr";

let connection: HubConnection | null = null;

export const createScheduleHubConnection = (
  getToken: () => Promise<string>,
): HubConnection => {
  connection = new HubConnectionBuilder()
    .withUrl("/hubs/schedule", {
      accessTokenFactory: getToken,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  return connection;
};

export const getScheduleHubConnection = (): HubConnection | null => {
  return connection;
};

export const startScheduleHub = async (
  getToken: () => Promise<string>,
): Promise<HubConnection> => {
  if (connection && connection.state !== "Disconnected") return connection;

  const hub = createScheduleHubConnection(getToken);
  await hub.start();
  return hub;
};

export const stopScheduleHub = async (): Promise<void> => {
  if (connection) {
    await connection.stop();
    connection = null;
  }
};
