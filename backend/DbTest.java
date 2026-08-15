import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
        String user = "neondb_owner";
        String password = "npg_oJ21CsYWzTie";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            System.out.println("Connected to DB!");
            
            // Check admin user
            String query = "SELECT id, username, is_active, password_hash FROM users WHERE username = 'admin'";
            try (PreparedStatement stmt = conn.prepareStatement(query);
                 ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    System.out.println("Admin found: " + rs.getString("id") + ", active=" + rs.getBoolean("is_active") + ", hash=" + rs.getString("password_hash"));
                } else {
                    System.out.println("Admin not found!");
                }
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
