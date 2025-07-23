using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSAApplication.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSkillSwapRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SkillSwapRequests_UserSkills_RequestedSkillId",
                table: "SkillSwapRequests");

            migrationBuilder.DropIndex(
                name: "IX_SkillSwapRequests_RequestedSkillId",
                table: "SkillSwapRequests");

            migrationBuilder.DropColumn(
                name: "RequestedSkillId",
                table: "SkillSwapRequests");

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_TargetSkillId",
                table: "SkillSwapRequests",
                column: "TargetSkillId");

            migrationBuilder.AddForeignKey(
                name: "FK_SkillSwapRequests_UserSkills_TargetSkillId",
                table: "SkillSwapRequests",
                column: "TargetSkillId",
                principalTable: "UserSkills",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SkillSwapRequests_UserSkills_TargetSkillId",
                table: "SkillSwapRequests");

            migrationBuilder.DropIndex(
                name: "IX_SkillSwapRequests_TargetSkillId",
                table: "SkillSwapRequests");

            migrationBuilder.AddColumn<int>(
                name: "RequestedSkillId",
                table: "SkillSwapRequests",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_RequestedSkillId",
                table: "SkillSwapRequests",
                column: "RequestedSkillId");

            migrationBuilder.AddForeignKey(
                name: "FK_SkillSwapRequests_UserSkills_RequestedSkillId",
                table: "SkillSwapRequests",
                column: "RequestedSkillId",
                principalTable: "UserSkills",
                principalColumn: "Id");
        }
    }
}
