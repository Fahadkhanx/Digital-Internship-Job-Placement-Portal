using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using InternshipPortal.API.Models;

namespace InternshipPortal.API.Data.Converters
{
    public class JobTypeConverter : ValueConverter<JobType, string>
    {
        public JobTypeConverter() : base(
            v => ConvertToString(v),
            v => ConvertFromString(v))
        {
        }

        private static string ConvertToString(JobType value)
        {
            return value switch
            {
                JobType.Internship => "internship",
                JobType.FullTime => "full-time",
                JobType.PartTime => "part-time",
                JobType.Contract => "contract",
                _ => value.ToString().ToLower()
            };
        }

        private static JobType ConvertFromString(string value)
        {
            return value switch
            {
                "internship" => JobType.Internship,
                "full-time" => JobType.FullTime,
                "part-time" => JobType.PartTime,
                "contract" => JobType.Contract,
                _ => (JobType)Enum.Parse(typeof(JobType), value.Replace("-", ""), true)
            };
        }
    }
}

