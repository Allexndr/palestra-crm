export const simulateSendEmail = async (toEmail, clubName, login) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    message: 'Доступ подготовлен',
    delivery: {
      email: toEmail,
      clubName,
      login,
    },
  };
};
