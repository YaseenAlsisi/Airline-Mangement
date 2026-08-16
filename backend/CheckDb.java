import java.sql.*;

public class CheckDb {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://ep-tiny-night-b1ydnyk0.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
        String user = "neondb_owner";
        String password = "npg_oJ21CsYWzTie";
        
        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT version, description, type, script, checksum, installed_on, success FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5")) {
             
            while (rs.next()) {
                System.out.println("V" + rs.getString("version") + " | " + 
                                   rs.getString("description") + " | " + 
                                   rs.getString("script") + " | " + 
                                   "success: " + rs.getBoolean("success"));
            }
        }
    }
}
