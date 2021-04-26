import { io } from "../http";
import { ConnectionsServices } from "../services/ConnectionsServices";
import { MessagesService } from "../services/MessagesService";
import { UsersServices } from "../services/UsersServices";

interface IParams {
  text: string;
  email: string;
}

io.on("connect", (socket) => {
  const connectionsServices = new ConnectionsServices();
  const usersServices = new UsersServices();
  const messagesService = new MessagesService();

  socket.on("client_first_connection", async (props: IParams) => {
    const { text, email } = props;

    const socket_id = socket.id;

    const userExiste = await usersServices.findByEmail(email);
    let user_id = userExiste?.id;

    if (!userExiste) {
      const user = await usersServices.create(email);

      await connectionsServices.create({
        user_id: user.id,
        socket_id,
      });

      user_id = user.id;
    } else {
      const connection = await connectionsServices.findByUserId(userExiste.id);

      if (!connection) {
        await connectionsServices.create({
          user_id: userExiste.id,
          socket_id,
        });
      } else {
        connection.socket_id = socket_id;
        await connectionsServices.create(connection);
      }
    }

    await messagesService.create({
      text,
      user_id,
    });

    const allMessages = await messagesService.listByUser(user_id);

    socket.emit("client_list_all_messages", allMessages);

    const allUsers = await connectionsServices.findAllWithoutAdmin();
    io.emit("admin_list_all_users", allUsers);
  });

  socket.on("client_to_send_to_admin", async (params) => {
    const { text, socket_admin_id } = params;

    const socket_id = socket.id;

    const { user_id } = await connectionsServices.findBySocketID(socket_id);

    const message = await messagesService.create({ text, user_id });

    io.to(socket_admin_id).emit("admin_receive_message", {
      message,
      socket_id,
    });
  });
});
