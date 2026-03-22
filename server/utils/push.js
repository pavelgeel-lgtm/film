import webpush from "web-push";
import pool from "../db/pool.js";

webpush.setVapidDetails(
  process.env.VAPID_MAILTO || "mailto:admin@3xmedia.ru",
  process.env.VAPID_PUBLIC_KEY  || "",
  process.env.VAPID_PRIVATE_KEY || ""
);

/**
 * Отправить push-уведомление пользователю и сохранить в таблицу notifications.
 * @param {number} userId
 * @param {{ title, body, type?, ref_type?, ref_id? }} payload
 */
export async function sendPush(userId, { title, body, type, ref_type, ref_id }) {
  // Сохранить уведомление в БД
  await pool.query(
    `INSERT INTO notifications (user_id, title, body, type, ref_type, ref_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [userId, title, body, type || "info", ref_type || null, ref_id || null]
  );

  // Получить все push-подписки пользователя
  const { rows } = await pool.query(
    "SELECT subscription FROM push_subscriptions WHERE user_id=$1",
    [userId]
  );

  const message = JSON.stringify({ title, body, type, ref_type, ref_id });

  await Promise.allSettled(
    rows.map(async (row) => {
      try {
        await webpush.sendNotification(row.subscription, message);
      } catch (err) {
        // Подписка протухла — удалить
        if (err.statusCode === 410 || err.statusCode === 404) {
          await pool.query(
            "DELETE FROM push_subscriptions WHERE user_id=$1 AND subscription=$2",
            [userId, row.subscription]
          );
        }
      }
    })
  );
}
