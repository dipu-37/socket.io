```



## ✅ Summary Table

| Function        | ব্যবহার হয় কোথায়?        | উদ্দেশ্য কী?                                 |
| --------------- | ------------------------ | -------------------------------------------- |
| `io.on()`       | **Server-side only**     | নতুন client connect হলে তাকে হ্যান্ডেল করা   |
| `socket.on()`   | **Client & Server side** | event শুনে, ক্লায়েন্ট বা সার্ভার রেসপন্স দেয় |
| `socket.emit()` | **Client & Server side** | event পাঠায়, data send করে                   |
| `io.emit()`     | **Server-side only**     | সকল client কে broadcast message পাঠায়        |



## 🔄 Communication Flow

### 🧭 1. `io.on('connection', socket => {...})`

* সার্ভারে যখন কোনো client connect করে, তখন এটা চলে।

```js
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);
});
```

---

### 🧭 2. `socket.emit('event', data)`

* কোনো client বা server থেকে event পাঠাতে হলে `emit` ব্যবহার হয়।

**Client → Server:**

```js
socket.emit('chat-message', 'Hello from client');
```

**Server → Client:**

```js
socket.emit('welcome', 'Welcome user!');
```

---

### 🧭 3. `socket.on('event', callback)`

* যেই event পাঠানো হয়েছে, সেইটা ধরার জন্য `on()` ব্যবহার হয়।

**Server side:**

```js
socket.on('chat-message', (msg) => {
  console.log('Received from client:', msg);
});
```

**Client side:**

```js
socket.on('welcome', (msg) => {
  alert(msg);
});
```

---

### 🧭 4. `io.emit('event', data)`

* সার্ভার থেকে **সব clients কে একসাথে** বার্তা পাঠানোর জন্য।

```js
io.emit('new-announcement', 'Site maintenance at 10PM!');
```

---

## ✅ উদাহরণ: Simple Chat Logic

### 🔸 Server Side:

```js
io.on('connection', (socket) => {
  console.log('🟢 New user connected');

  socket.on('chat', (msg) => {
    io.emit('chat', msg); // Send to all users
  });
});
```

### 🔸 Client Side:

```js
// Send
socket.emit('chat', 'Hello Everyone');

// Receive
socket.on('chat', (msg) => {
  console.log('New Message:', msg);
});
```

---

## 🧠 কবে কোনটা ব্যবহার করবো?

| তোমার প্রয়োজন                  | তুমি ব্যবহার করো      |
| ------------------------------ | --------------------- |
| Client connect হলে detect করতে | `io.on('connection')` |
| Server থেকে সকলকে notify করতে  | `io.emit()`           |
| কোনো event এর response দিতে    | `socket.on()`         |
| Event trigger করে data পাঠাতে  | `socket.emit()`       |

---

## 🔚 Conclusion

> **`socket.emit` = পাঠাও**
> **`socket.on` = ধরো**
> **`io.on` = নতুন client ধরো**
> **`io.emit` = সকলকে পাঠাও**

---


```