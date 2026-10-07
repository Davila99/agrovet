import React from "react";
import { Box, Avatar, Typography, Rating, Button, Card } from "@mui/material";
import VerificationBadge from "../../profile/molecules/VerificationBadge";

export const SpecialistCard = ({ specialist, onClick, onConsult, mainGreen, textDark }) => {
  const rating = Number(specialist?.specialist_profile?.puntuations) || 0;
  const profession = specialist.specialist_profile?.profession || "Veterinario";
  const profile = specialist.specialist_profile || {};
  let verificationStatus = profile.verification_status;
  let verificationType = profile.verification_type;
  
  const hasTitle = !!(profile.verification_title_id || profile.verification_title);
  const hasStudentCard = !!(profile.verification_student_card_id || profile.verification_student_card);
  const hasGraduationLetter = !!(profile.verification_graduation_letter_id || profile.verification_graduation_letter);
  const hasAnyDoc = hasTitle || hasStudentCard || hasGraduationLetter;
  
  if (!verificationStatus && hasAnyDoc) {
    if (hasTitle || hasGraduationLetter) {
      verificationStatus = 'verified_professional';
      verificationType = verificationType || 'Médico Titulado';
    } else if (hasStudentCard) {
      verificationStatus = 'verified_student';
      verificationType = verificationType || 'Estudiante';
    }
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        mb: 1.5,
        borderRadius: 2,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.2,
        cursor: "pointer",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        boxShadow: "0 2px 8px rgba(46,125,50,0.1)",
        transition: "all 0.2s ease-in-out",
        gap: 1,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 5px 15px rgba(46,125,50,0.25)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          maxWidth: "calc(100% - 90px)",
        }}
      >
        <Avatar
          src={specialist.profile_picture || specialist.profile_picture_url || ""}
          alt={specialist.full_name || specialist.username}
          sx={{
            width: 44,
            height: 44,
            border: `2px solid ${mainGreen}`,
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", pr: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: textDark, fontSize: "0.9rem" }}
              noWrap
            >
              {specialist.full_name || specialist.username}
            </Typography>
            {verificationStatus && (
              <VerificationBadge
                verificationStatus={verificationStatus}
                verificationType={verificationType}
                size="small"
              />
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{ color: mainGreen, fontWeight: 500, fontSize: "0.8rem" }}
            noWrap
          >
            {profession}
          </Typography>
          <Rating
            name={`rating-${specialist.id}`}
            value={rating}
            precision={0.5}
            readOnly
            size="small"
            sx={{ mt: 0.1, color: mainGreen }}
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        sx={{
          textTransform: "none",
          backgroundColor: mainGreen,
          "&:hover": { backgroundColor: "#256628" },
          fontSize: "0.7rem",
          minWidth: 75,
          maxWidth: 85,
          width: "auto",
          flexShrink: 0,
          px: 1.2,
          py: 0.6,
          whiteSpace: "nowrap",
          borderRadius: 1.5,
        }}
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onConsult();
        }}
      >
        Consultar
      </Button>
    </Card>
  );
};
