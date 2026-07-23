using System;
using BCrypt.Net;

class Program {
    static void Main() {
        string hash = "$2a$11$wE4C3KkKqy.Wv.zO7O./e.bB13o0V0jO9sXn3bNqGq9uM.6Z6rWfG";
        string pass = "Admin123!";
        bool match = BCrypt.Net.BCrypt.Verify(pass, hash);
        Console.WriteLine($"Match: {match}");
    }
}
