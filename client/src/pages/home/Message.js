import React from "react";

export default function Message({ message }) {
	return (
		<div className="py-2 ppx-3 rounded-pill bg-primary">
			<p key={message.uuid}>{message.content}</p>
		</div>
	);
}
