using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MSAApplication.Migrations
{
    /// <inheritdoc />
    public partial class AddSkillSwapRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SkillSwapRequests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequesterId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OfferedSkillId = table.Column<int>(type: "integer", nullable: false),
                    TargetSkillId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RequestedSkillId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillSwapRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkillSwapRequests_UserSkills_OfferedSkillId",
                        column: x => x.OfferedSkillId,
                        principalTable: "UserSkills",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SkillSwapRequests_UserSkills_RequestedSkillId",
                        column: x => x.RequestedSkillId,
                        principalTable: "UserSkills",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SkillSwapRequests_Users_RequesterId",
                        column: x => x.RequesterId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SkillSwapRequests_Users_TargetUserId",
                        column: x => x.TargetUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_OfferedSkillId",
                table: "SkillSwapRequests",
                column: "OfferedSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_RequestedSkillId",
                table: "SkillSwapRequests",
                column: "RequestedSkillId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_RequesterId",
                table: "SkillSwapRequests",
                column: "RequesterId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillSwapRequests_TargetUserId",
                table: "SkillSwapRequests",
                column: "TargetUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SkillSwapRequests");
        }
    }
}
