using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSAApplication.Migrations
{
    /// <inheritdoc />
    public partial class RemovePasswordFromUsers_AddUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Users_SupabaseUserId",
                table: "Users",
                column: "SupabaseUserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_SupabaseUserId",
                table: "Users");
        }
    }
}
