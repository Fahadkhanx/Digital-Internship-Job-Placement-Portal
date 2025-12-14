using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using InternshipPortal.API.Models;

namespace InternshipPortal.API.Data.Converters
{
    public class MeetingStatusConverter : ValueConverter<MeetingStatus, string>
    {
        public MeetingStatusConverter() : base(
            // Convert enum to database string (handle InProgress -> in_progress)
            v => ConvertToDatabase(v),
            // Convert database string to enum (handle in_progress -> InProgress)
            v => ConvertFromDatabase(v)
        )
        {
        }

        private static string ConvertToDatabase(MeetingStatus status)
        {
            var str = status.ToString().ToLower();
            // Handle InProgress enum value -> in_progress database value
            if (str == "inprogress")
                return "in_progress";
            return str;
        }

        private static MeetingStatus ConvertFromDatabase(string value)
        {
            // Handle in_progress database value -> InProgress enum value
            var normalized = value.Replace("_", "");
            // Capitalize first letter
            normalized = char.ToUpper(normalized[0]) + normalized.Substring(1);
            return (MeetingStatus)Enum.Parse(typeof(MeetingStatus), normalized, true);
        }
    }
}

