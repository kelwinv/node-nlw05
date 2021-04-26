let socket_admin_id = null;
let emailUser = null;
let socket = null;

document.querySelector("#start_chat").addEventListener("click", (event) => {
  socket = io();

  const chat_help = document.getElementById("chat_help");
  chat_help.style.display = "none";

  const chat_in_support = document.getElementById("chat_in_support");
  chat_in_support.style.display = "block";

  const email = document.querySelector("#email").value;
  emailUser = email;
  const text = document.querySelector("#txt_help").value;

  const params = { email, text };

  socket.on("connect", () => {
    socket.emit("client_first_connection", params, (call, err) => {
      if (err) {
        console.log(errr);
      } else {
        console.log(call);
      }
    });
  });

  socket.on("client_list_all_messages", (messages) => {
    var template_client = document.getElementById("message-user-template")
      .innerHTML;
    var template_admin = document.getElementById("admin-template").innerHTML;

    messages.forEach((message) => {
      let rendered;
      if (message.admin_id === null) {
        rendered = Mustache.render(template_client, {
          message: message.text,
          email,
        });
      } else {
        rendered = Mustache.render(template_admin, {
          message_admin: message.text,
        });
      }

      document.getElementById("messages").innerHTML += rendered;
    });
  });

  socket.on("admin_send_to_client", (message) => {
    socket_admin_id = message.socket_id;
    const template_admin = document.getElementById("admin-template").innerHTML;

    const rendered = Mustache.render(template_admin, {
      message_admin: message.text,
    });

    document.getElementById("messages").innerHTML += rendered;
  });
});

document
  .querySelector("#send_message_button")
  .addEventListener("click", (event) => {
    const text = document.getElementById("message_user");

    const params = {
      text: text.value,
      socket_admin_id,
    };

    socket.emit("client_to_send_to_admin", params);

    const template_client = document.getElementById("message-user-template")
      .innerHTML;

    const rendered = Mustache.render(template_client, {
      message: text.value,
      email: emailUser,
    });

    document.getElementById("messages").innerHTML += rendered;

    text.value = "";
  });